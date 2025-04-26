from diffusers import StableDiffusionPipeline
import torch

model_stable = "stabilityai/stable-diffusion-xl-base-1.0"
model_lykon ="lykon/dreamshaper-8"

def gen_photo(promt, model = model_lykon,size = 128*4):
    pipe = StableDiffusionPipeline.from_pretrained(model_lykon,torch_dtype=torch.float16, safety_checker = None)
    pipe = pipe.to("cuda")
    image = pipe(promt,num_inference_steps=50, width=size, height= size).images[0]
    image.save(r"send\image.png")
    print("Photo  generated")

        
    