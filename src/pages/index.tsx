import SamWorker from "@/workers/sam?worker"
import { ClientOnly, UButton, UContainer, UTable } from "#components"


const BASE_URL = "https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/"
const EXAMPLE_URL = BASE_URL + "corgi.jpg"

const worker = new SamWorker()

function clamp(x, min = 0, max = 1) {
  return Math.max(Math.min(x, max), min)
}


interface TPoint {
  label: number
  point: number[]
}


export default defineComponent({
  setup(props) {
    const btnCutDisable = ref(true)
    const baseImage = ref("")
    const status = ref("")
    const progressBarLog = ref([])
    const refContainer = ref()
    const refMaskCanvas = ref()
    const lastPoints = ref<TPoint[]>([])
    const isEncoded = ref(false)
    const isDecoding = ref(false)
    const isMultiMaskMode = ref(false)
    const modelReady = ref(false)
    const imageDataURI = ref("")
    const samReady = ref(false)

    const getMaskCanvas = () => {
      if (!refMaskCanvas.value) {
        throw Error("make")
      }
      return refMaskCanvas.value
    }


    onMounted(() => {
      // MaskCanvasSingleton.getInstance(refMaskCanvas?.value)
    })


    function decode() {
      isDecoding.value = true
      worker.postMessage({
        type: "decode",
        data: toRaw(lastPoints.value),
      })
    }

    function getPoint(e) {
      const bb = refContainer.value.getBoundingClientRect()
      const mouseX = clamp((e.clientX - bb.left) / bb.width)
      const mouseY = clamp((e.clientY - bb.top) / bb.height)

      return {
        point: [mouseX, mouseY],
        label: e.button === 2 // right click
          ? 0  // negative prompt
          : 1, // positive prompt
      }
    }

    function clearPointsAndMask() {
      // Reset state
      isMultiMaskMode.value = false
      lastPoints.value = []

      // Disable cut button
      btnCutDisable.value = true

      // Reset mask canvas
      const maskCanvas = getMaskCanvas()
      maskCanvas.getContext("2d").clearRect(0, 0, maskCanvas.width, maskCanvas.height)
    }

    function segment(data: string) {
      // Update state
      isEncoded.value = false
      if (!modelReady) {
        status.value = "Loading model..."
      }

      baseImage.value = data
      btnCutDisable.value = true
      imageDataURI.value = data

      worker.postMessage({
        type: "segment",
        data,
      })
    }

    worker.addEventListener("message", (e) => {
      const {
        type,
        data,
      } = e.data
      if (type === "ready") {
        modelReady.value = true
        status.value = "Ready"
        samReady.value = true
      } else if (type === "decode_result") {
        isDecoding.value = false

        if (!isEncoded) {
          return // We are not ready to decode yet
        }

        if (!isMultiMaskMode.value && lastPoints.value.length === 0) {
          // Perform decoding with the last point
          decode()
          lastPoints.value = []
        }

        const {
          mask,
          scores,
        } = data

        const maskCanvas = getMaskCanvas()
        if (maskCanvas.width !== mask.width || maskCanvas.height !== mask.height) {
          maskCanvas.width = mask.width
          maskCanvas.height = mask.height
        }

        // Create context and allocate buffer for pixel data
        const context = maskCanvas.getContext("2d")
        const imageData = context.createImageData(maskCanvas.width, maskCanvas.height)

        // Select best mask
        const numMasks = scores.length // 3
        let bestIndex = 0
        for (let i = 1; i < numMasks; ++i) {
          if (scores[i] > scores[bestIndex]) {
            bestIndex = i
          }
        }
        status.value = `Segment score: ${scores[bestIndex].toFixed(2)}`

        // Fill mask with colour
        const pixelData = imageData.data
        for (let i = 0; i < pixelData.length; ++i) {
          if (mask.data[numMasks * i + bestIndex] === 1) {
            const offset = 4 * i
            pixelData[offset] = 0 // red
            pixelData[offset + 1] = 114 // green
            pixelData[offset + 2] = 189 // blue
            pixelData[offset + 3] = 255 // alpha
          }
        }

        // Draw image data to context
        context.putImageData(imageData, 0, 0)

      } else if (type === "segment_result") {
        if (data === "start") {
          status.value = "Extracting image embedding..."
        } else {
          status.value = "Embedding extracted!"
          isEncoded.value = true
        }
      } else if (type === "sam_model_download") {
        if (data.progress) {
          data.progress = data.progress.toFixed(2)
        }
        progressBarLog.value = data
      }
    })


    return () => (
      <ClientOnly>
        <UContainer>
          <h1 class="text-3xl text-zinc-800 font-bold">Nuxt Segment Anything WebGPU</h1>
          <h3 class="text-2xl text-zinc-600">
            In-browser image segmentation via {" "}
            <a href="https://hf.co/docs/transformers.js" target="_blank" class="hover:text-primary-500">
              Transformers.js
            </a>
          </h3>
          <div id="container"
               onContextmenu={(e) => {
                 if (baseImage.value) {
                   e.preventDefault()
                 }
               }}
               onMousemove={(e) => {
                 if (!isEncoded.value || isMultiMaskMode.value) {
                   // Ignore mousemove events if the image is not encoded yet,
                   // or we are in multi-mask mode
                   return
                 }
                 lastPoints.value = [getPoint(e)]

                 if (!isDecoding.value) {
                   decode() // Only decode if we are not already decoding
                 }
               }}
               ref={refContainer}
               style={{
                 backgroundImage: baseImage.value ? `url(${baseImage.value})` : "none",
               }}
               onMousedown={(e) => {
                 e.preventDefault()
                 if (e.button !== 0 && e.button !== 2) {
                   return // Ignore other buttons
                 }
                 if (!isEncoded.value) {
                   return // Ignore if not encoded yet
                 }
                 if (!isMultiMaskMode.value) {
                   lastPoints.value = []
                   isMultiMaskMode.value = true
                   btnCutDisable.value = false
                 }
                 if (!baseImage.value) {
                   return
                 }

                 const point = getPoint(e)
                 lastPoints.value.push(point)
                 decode()
               }}
          >
            <label id="upload-button" class={{
              display: baseImage.value ? "none" : "flex",
            }} for="upload">
              {
                !baseImage.value && <>
                  <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#000"
                          d="M3.5 24.3a3 3 0 0 1-1.9-.8c-.5-.5-.8-1.2-.8-1.9V2.9c0-.7.3-1.3.8-1.9.6-.5 1.2-.7 2-.7h18.6c.7 0 1.3.2 1.9.7.5.6.7 1.2.7 2v18.6c0 .7-.2 1.4-.7 1.9a3 3 0 0 1-2 .8H3.6Zm0-2.7h18.7V2.9H3.5v18.7Zm2.7-2.7h13.3c.3 0 .5 0 .6-.3v-.7l-3.7-5a.6.6 0 0 0-.6-.2c-.2 0-.4 0-.5.3l-3.5 4.6-2.4-3.3a.6.6 0 0 0-.6-.3c-.2 0-.4.1-.5.3l-2.7 3.6c-.1.2-.2.4 0 .7.1.2.3.3.6.3Z"
                    >
                    </path>
                  </svg>
                  Click to upload image
                  <label id="example" onClick={(e) => {
                    e.preventDefault()
                    segment(EXAMPLE_URL)
                  }}>(or try example)</label>
                </>
              }
            </label>
            <canvas ref={refMaskCanvas} id="mask-output"></canvas>
            {
              lastPoints.value.map((point) => {
                return <>
                  {
                    point.label === 1 ? <img class="icon" src={BASE_URL + "star-icon.png"} style={{
                        left: `${point.point[0] * 100}%`,
                        top: `${point.point[1] * 100}%`,
                      }} /> :
                      <img class="icon" src={BASE_URL + "cross-icon.png"} style={{
                        left: `${point.point[0] * 100}%`,
                        top: `${point.point[1] * 100}%`,
                      }} />
                  }
                </>
              })
            }
            {
              (!isEncoded.value && baseImage.value) &&
              <div class={"absolute flex justify-center items-center z-10 bg-white w-full h-full"}>
                <div class="flex flex-col">
                  <div>loading model</div>
                  {
                    progressBarLog.value.map(x => {
                      return (
                        <div>
                          {
                            `${x.file} | ${x.status} ${x.progress.toFixed(2)}%`
                          }
                        </div>
                      )
                    })
                  }
                </div>
              </div>
            }
          </div>
          <label id="status">{status.value}</label>
          <div id="controls" class="mt-2 space-x-2">
            <UButton
              id="reset-image"
              onClick={() => {
                // Update state
                isEncoded.value = false
                imageDataURI.value = ""

                worker.postMessage({ type: "reset" })

                // Clear points and mask (if present)
                clearPointsAndMask()

                // Update UI
                btnCutDisable.value = true
                baseImage.value = ""
                status.value = "Ready"
              }}
            >Reset image
            </UButton>
            <UButton id="clear-points" onClick={() => {
              clearPointsAndMask()
            }}>Clear points
            </UButton>
            <UButton
              id="cut-mask"
              disabled={btnCutDisable.value}
              onClick={(e) => {
                // Update canvas dimensions (if different)
                const maskCanvas = getMaskCanvas()
                const [w, h] = [maskCanvas.width, maskCanvas.height]

                // Get the mask pixel data
                const maskContext = maskCanvas.getContext("2d")
                const maskPixelData = maskContext.getImageData(0, 0, w, h)
                // Load the image
                const image = new Image()
                image.crossOrigin = "anonymous"
                image.onload = async () => {
                  // Create a new canvas to hold the image
                  const imageCanvas = new OffscreenCanvas(w, h)
                  const imageContext = imageCanvas.getContext("2d")
                  imageContext!.drawImage(image, 0, 0, w, h)
                  const imagePixelData = imageContext!.getImageData(0, 0, w, h)

                  // Create a new canvas to hold the cut-out
                  const cutCanvas = new OffscreenCanvas(w, h)
                  const cutContext = cutCanvas.getContext("2d")
                  const cutPixelData = cutContext!.getImageData(0, 0, w, h)

                  // Copy the image pixel data to the cut canvas
                  for (let i = 3; i < maskPixelData.data.length; i += 4) {
                    if (maskPixelData.data[i] > 0) {
                      for (let j = 0; j < 4; ++j) {
                        const offset = i - j
                        cutPixelData.data[offset] = imagePixelData.data[offset]
                      }
                    }
                  }
                  cutContext!.putImageData(cutPixelData, 0, 0)

                  // Download image
                  const link = document.createElement("a")
                  link.download = "image.png"
                  link.href = URL.createObjectURL(await cutCanvas.convertToBlob())
                  link.click()
                  link.remove()
                }
                image.src = imageDataURI.value
                console.log("image.src", imageDataURI)
              }}
            >Cut Mask
            </UButton>
          </div>
          <p id="information">
            Left click = positive points, right click = negative points.
          </p>
          <input id="upload" type="file" accept="image/*" onChange={(e) => {
            const file = e.target.files[0]
            if (!file) {
              return
            }

            const reader = new FileReader()

            // Set up a callback when the file is loaded
            reader.onload = e2 => segment(e2.target.result)

            reader.readAsDataURL(file)

          }}
          />
        </UContainer>

      </ClientOnly>
    )
  },
})

