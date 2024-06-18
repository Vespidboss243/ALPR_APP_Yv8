import string
import easyocr
import requests
import json
import pytesseract

#pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# Initialize the OCR reader
reader = easyocr.Reader(['es'], gpu=True)

# Mapping dictionaries for character conversion
dict_char_to_int = {'O': '0',
                    'I': '1',
                    'J': '3',
                    'A': '4',
                    'G': '6',
                    'S': '5'}

dict_int_to_char = {'0': 'O',
                    '1': 'I',
                    '3': 'J',
                    '4': 'A',
                    '6': 'G',
                    '5': 'S'}


def license_complies_format(text):
    
    if len(text) != 6:
        return False

    if (text[0] in string.ascii_uppercase or text[0] in dict_int_to_char.keys()) and \
       (text[1] in string.ascii_uppercase or text[1] in dict_int_to_char.keys()) and \
       (text[2] in string.ascii_uppercase or text[2] in dict_int_to_char.keys()) and \
       (text[3] in ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] or text[3] in dict_char_to_int.keys()) and \
       (text[4] in ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] or text[4] in dict_char_to_int.keys()) and \
       (text[5] in ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] or text[5] in dict_char_to_int.keys()):
       
        return True
    else:
        return False


def format_license(text):
    
    license_plate_ = ''
    mapping = {0: dict_int_to_char, 1: dict_int_to_char, 2: dict_int_to_char,
               3: dict_char_to_int, 4: dict_char_to_int,5: dict_char_to_int}
    for j in [0, 1, 2, 3, 4, 5]:
        if text[j] in mapping[j].keys():
            license_plate_ += mapping[j][text[j]]
        else:
            license_plate_ += text[j]

    return license_plate_

def read_license_plate(license_plate_crop):
    
    detections = reader.readtext(license_plate_crop)
    
    
    for detection in detections:
        bbox, text, score = detection

        text = text.upper().replace(' ', '')
        

        if license_complies_format(text):
            return format_license(text), score
    return None, None

def send_license_plate(license_plate_number):
  url = 'http://localhost:6970/plate'
  
  data = {'plate': license_plate_number}
  headers = {'Content-Type': 'application/json'}  
  response = requests.post(url, data=json.dumps(data), headers=headers)
  if response.status_code == 200:
    return "La solicitud fue exitosa."
  else:
    return "Hubo un error en la solicitud:"


    
    
    


