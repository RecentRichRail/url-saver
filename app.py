from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///link_data.db'
db = SQLAlchemy(app)

class Links(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    url = db.Column(db.String(500), unique=True, nullable=False)

with app.app_context():
    db.create_all()

@app.route('/api', methods=['POST'])
def api():
    data = request.json
    action = data.get('action')
    
    if action == 'initial_data':
        print("Initial data")
        return jsonify({
            'urls': [link.url for link in Links.query.all()]
        })
    
    if action == 'add_url':
        print("add_url")
        url = data['url']
        if Links.query.filter_by(url=url).first():
            return jsonify({'status': 'error', 'message': 'Link already exists'}), 400
        new_url = Links(url=url)
        print(url)
        db.session.add(new_url)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Link added successfully'})

    if action == 'remove_url':
        print("remove_url")
        url = data['url']
        remove_url = Links.query.filter_by(url=url).first()
        if url:
            db.session.delete(remove_url)
            db.session.commit()
            return jsonify({'status': 'success', 'message': 'Link removed successfully'})
        return jsonify({'status': 'error', 'message': 'Link not found'}), 404

@app.route("/")
def index():
    return render_template("index.html")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=27645, debug=True)