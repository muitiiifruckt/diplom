from diffusers import StableDiffusionPipeline
import torch

model_stable = "stabilityai/stable-diffusion-xl-base-1.0"
model_lykon ="lykon/dreamshaper-8"
pipe = StableDiffusionPipeline.from_pretrained(model_lykon,torch_dtype=torch.float16, safety_checker = None)
pipe = pipe.to("cuda")

size = 128*4
prompt ="""A close-up shot of a block of cheddar cheese on a wooden cutting board, with sunlight streaming through a window and illuminating its texture.  Think sharp focus, vibrant colors, and subtle detail."""




image = pipe(prompt,num_inference_steps=50, width=size, height= size).images[0]
image.save("cat_rain.png")
def gen_photo(promt, model = model_lykon,size = 128*4):
    pipe = StableDiffusionPipeline.from_pretrained(model_lykon,torch_dtype=torch.float16, safety_checker = None)
    pipe = pipe.to("cuda")
    image = pipe(prompt,num_inference_steps=50, width=size, height= size).images[0]
    image.save(r"send\image.png")
    print("Photo  generated")

        
    