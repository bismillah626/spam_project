from flask import Flask,request,jsonify
from flask_cors import CORS
import pickle
import nltk
from nltk.corpus import stopwords
import string
nltk.download('punkt')
nltk.download('punkt_tab')   
nltk.download('stopwords')

#Initialzing Flask
app = Flask(__name__)
CORS(app)

#Loading the model
tfidf = pickle.load(open('vectorizer.pkl','rb'))
model = pickle.load(open('model.pkl','rb'))
ps = nltk.PorterStemmer()
def transform_text(text):
    text = text.lower()
    text = nltk.word_tokenize(text)

    y = []
    for i in text:
        if i.isalnum():
            y.append(i)
    text = y[:]
    y.clear()

    for i in text:
        if i not in stopwords.words('english') and i not in string.punctuation:
             y.append(i)
    text = y[:]
    y.clear()

    for i in text:
        y.append(ps.stem(i))

    return " ".join(y)


@app.route('/predict',methods = ['POST'])
def predict():
    data = request.json
    email_text = data['text']

    # preprocessing
    transformed_text = transform_text(email_text)
    # vectorizing the text
    vector_input = tfidf.transform([transformed_text]).toarray()
    # predict
    result = model.predict(vector_input)[0]

    return jsonify({'is_spam': int(result)})
if __name__ == '__main__':
    app.run(port = 5000)


        
