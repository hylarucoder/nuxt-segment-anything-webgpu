import { SamModel, AutoProcessor, RawImage, Tensor, env } from "@xenova/transformers"

// env.localModelPath = "/models/"
// env.allowRemoteModels = false
// env.allowLocalModels = true


// We adopt the singleton pattern to enable lazy-loading of the model and processor.
export class SegmentAnythingSingleton {
  // static model_id = "sam/slimsam-77-uniform"
  static model_id = "Xenova/slimsam-77-uniform"
  static model: SamModel
  static processor: AutoProcessor

  static getInstance(progress_callback) {
    if (!this.model) {
      this.model = SamModel.from_pretrained(this.model_id, {
        dtype: {
          vision_encoder: "fp16",
          prompt_encoder_mask_decoder: "q8",
        },
        device: {
          vision_encoder: "webgpu",
          prompt_encoder_mask_decoder: "wasm",
        },
        progress_callback: (progress) => {
          progress.from = "SamModel"
          progress_callback(progress)
        },
      })
    }
    if (!this.processor) {
      this.processor = AutoProcessor.from_pretrained(
        this.model_id,
        {
          progress_callback: (progress) => {
            progress.from = "AutoProcessor"
            progress_callback(progress)
          },
        },
      )
    }

    return Promise.all([this.model, this.processor])
  }
}

// State variables
let imageEmbeddings = null
let imageInputs = null
let ready = false
let readyNess = {
  "config.json": 0,
  "onnx/prompt_encoder_mask_decoder_quantized.onnx": 0,
  "onnx/vision_encoder_fp16.onnx": 0,
  "preprocessor_config.json": 0,
}
const samModelDownloadProgress = [
  {
    file: "config.json",
    progress: 0,
    status: "initial",
  },
  {
    file: "onnx/prompt_encoder_mask_decoder_quantized.onnx",
    progress: 0,
    status: "initial",
  },
  {
    file: "onnx/vision_encoder_fp16.onnx",
    progress: 0,
    status: "initial",
  },
  {
    file: "preprocessor_config.json",
    progress: 0,
    status: "initial",
  },
]

const computeProgress = (step) => {
  let progress = step.progress || 0
  if (step.status === "initial") {
    progress = 0
  }
  if (step.status === "done") {
    progress = 100
  }
  return {
    file: step.file,
    progress,
    status: step.status,
  }
}

self.onmessage = async (e) => {
  const [model, processor] = await SegmentAnythingSingleton.getInstance((progress) => {
    const targetProgress = samModelDownloadProgress.find((x) => x.file === progress.file) as any
    const fileProgress = computeProgress(progress)
    targetProgress.file = fileProgress.file
    targetProgress.progress = fileProgress.progress
    targetProgress.status = fileProgress.status
    self.postMessage({
      type: "sam_model_download",
      data: samModelDownloadProgress,
    })
  })
  if (!ready) {
    ready = true
    self.postMessage({
      type: "ready",
    })
  }

  const { type, data } = e.data
  if (type === "reset") {
    imageInputs = null
    imageEmbeddings = null

  } else if (type === "segment") {
    // Indicate that we are starting to segment the image
    self.postMessage({
      type: "segment_result",
      data: "start",
    })

    // Read the image and recompute image embeddings
    const image = await RawImage.read(e.data.data)
    imageInputs = await processor(image)
    imageEmbeddings = await model.get_image_embeddings(imageInputs)

    // Indicate that we have computed the image embeddings, and we are ready to accept decoding requests
    self.postMessage({
      type: "segment_result",
      data: "done",
    })

  } else if (type === "decode") {
    // Prepare inputs for decoding
    const reshaped = imageInputs.reshaped_input_sizes[0]
    const points = data.map(x => [x.point[0] * reshaped[1], x.point[1] * reshaped[0]])
    const labels = data.map(x => BigInt(x.label))

    const input_points = new Tensor(
      "float32",
      points.flat(Infinity),
      [1, 1, points.length, 2],
    )
    const input_labels = new Tensor(
      "int64",
      labels.flat(Infinity),
      [1, 1, labels.length],
    )

    // Generate the mask
    const { pred_masks, iou_scores } = await model({
      ...imageEmbeddings,
      input_points,
      input_labels,
    })

    // Post-process the mask
    const masks = await processor.post_process_masks(
      pred_masks,
      imageInputs.original_sizes,
      imageInputs.reshaped_input_sizes,
    )

    // Send the result back to the main thread
    self.postMessage({
      type: "decode_result",
      data: {
        mask: RawImage.fromTensor(masks[0][0]),
        scores: iou_scores.data,
      },
    })

  } else {
    throw new Error(`Unknown message type: ${type}`)
  }
}
