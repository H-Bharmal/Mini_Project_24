from flask import Flask, request, render_template
import os
from io import BytesIO
from PIL import Image
import numpy as np
import torch
import tensorflow as tf
from tensorflow.keras.preprocessing import image
import RRDBNet_arch as arch

app = Flask(__name__)

# Load classification model
classification_model_path = 'D:/minip/minip/notebooks/ocular_disease_vgg16_2.h5'
classification_model = tf.keras.models.load_model(classification_model_path)
class_labels = ['cataract', 'diabetic_retinopathy', 'glaucoma', 'normal']

# Load ESRGAN model
esrgan_model_path = 'D:/minip/minip/notebooks/esrgan/RRDB_ESRGAN_x4.pth'
device = torch.device('cpu')  # Use CPU for ESRGAN
esrgan_model = arch.RRDBNet(3, 3, 64, 23, gc=32)
esrgan_model.load_state_dict(torch.load(esrgan_model_path), strict=True)
esrgan_model.eval()
esrgan_model = esrgan_model.to(device)

def preprocess_image(img_path):
    img = image.load_img(img_path, target_size=(224, 224))
    img_array = image.img_to_array(img)
    img_array = np.expand_dims(img_array, axis=0)
    img_array /= 255.0  # Rescale the image
    return img_array

def super_resolve_image(img):
    original_size = img.size
    img = np.array(img) * 1.0 / 255
    img = torch.from_numpy(np.transpose(img[:, :, [2, 1, 0]], (2, 0, 1))).float()
    img_LR = img.unsqueeze(0).to(device)

    with torch.no_grad():
        output = esrgan_model(img_LR).data.squeeze().float().cpu().clamp_(0, 1).numpy()
    output = np.transpose(output[[2, 1, 0], :, :], (1, 2, 0))
    output = (output * 255.0).round().astype(np.uint8)
    enhanced_img = Image.fromarray(output)

    # Resize the enhanced image back to the original size
    resized_enhanced_img = enhanced_img.resize(original_size)
    return resized_enhanced_img

@app.route('/', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        file = request.files['file']
        if file:
            # Save and process the original image
            img = Image.open(BytesIO(file.read()))
            original_img_path = 'static/original_image.png'
            img.save(original_img_path)

            # Process and save the enhanced image
            enhanced_img = super_resolve_image(img)
            enhanced_img_path = 'static/enhanced_image.png'
            enhanced_img.save(enhanced_img_path)

            # Classify the original image
            preprocessed_img = preprocess_image(original_img_path)
            prediction = classification_model.predict(preprocessed_img)
            predicted_class = class_labels[np.argmax(prediction)]

            return render_template('result2.html', class_name=predicted_class, original_img_path=original_img_path, enhanced_img_path=enhanced_img_path)
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)
