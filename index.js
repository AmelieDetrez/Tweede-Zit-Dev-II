//FIREBASE//

class Firebase {
    constructor(apiKey, projectId, storageBucket) {
        firebase.initializeApp({
            apiKey,
            projectId,
            storageBucket
        });
        this.database = firebase.firestore();
        this.fileStorage = firebase.storage().ref();
    }
    convertQuerySnapshotToRegularArray(querySnapshot) {
        return querySnapshot.docs.map((item) => ({
            id: item.id,
            ...item.data()
        }));
    }
    get commentsCollection() {
        return this.database.collection("comments");
    }
}

export const firebaseInstance = new Firebase('AIzaSyCMCrXJpcUe_oWZ3CyNMnC05DvoV6XNPeg', 'taak-dev-ii', 'taak-dev-ii.appspot.com');

//SHOWING COMMENTS//

class Comments {
    constructor() {
        this.htmlElement = document.getElementById('comments');
    }
    sortByTimeStamp(a, b) {
        if (a.createdAt < b.createdAt) {
            return 1;
        }
        if (a.createdAt > b.createdAt) {
            return -1;
        }
    }
    render() {
        firebaseInstance.commentsCollection.onSnapshot((querySnapshot) => {
            let htmlString = '';
            const commentsData = firebaseInstance.convertQuerySnapshotToRegularArray(querySnapshot);
            commentsData.sort(this.sortByTimeStamp);
            commentsData.forEach((commentData) => {
                const commentInstance = new Comment(commentData);
                htmlString += commentInstance.htmlString;
            })
            this.htmlElement.innerHTML = htmlString;

            commentsData.forEach((commentData) => {
                const commentInstance = new Comment(commentData);
                commentInstance.bindEvents();
            });
        })
    }
}

const comments = new Comments();
comments.render();

export class Comment {
    constructor(data) {
        this.data = data;
    }
    get readableDate() {
        const date = new Date(this.data.createdAt.seconds * 1000);
        const readableTime = date.toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit'
        })
        const readableDate = date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        return `${readableTime} ${readableDate}`;
    }
    get htmlString() {
        return `
      <section id="${this.data.id}" class="comment">
        <h4>${this.data.title}</h4>
        <h6>${this.readableDate}</h6>
        <p>${this.data.description}</p>
        <hr>
      </section>
    `;
    }
}

export const test = 5;

//SUBMITTING FORM, DOESN'T WORK :(//

class Form {
    constructor() {
        this.formElement = document.getElementById('form');
        this.titleElement = document.getElementById('title');
        this.descriptionElement = document.getElementById('description');
        this.bindEvents();

    }
    uploadFile(callback) {
        firebaseInstance.fileStorage.child(this.selectedFile.name).put(this.selectedFile).then((snapshot) => {
            snapshot.ref.getDownloadURL().then(callback);
        });
    }
    uploadData() {
        firebaseInstance.commentsCollection.add({
            title: this.titleElement.value,
            description: this.descriptionElement.value,
            createdAt: new Date(),
        });
    }
    clearForm() {
        this.titleElement.value = '';
        this.descriptionElement.value = '';
    }
    submitForm(event) {
        event.preventDefault();
        this.uploadFile(() => {
            this.uploadData();
            this.clearForm();
        });
    }
    bindEvents() {
        this.formElement.addEventListener('submit', this.submitForm.bind(this));
    }
}

new Form();

//API//

//Followed tutorial from Mr.Jeff Astor on YouTube//

let button = document.querySelector("#submit");
let input = document.querySelector("#search");
let output = document.querySelector("#output");

button.addEventListener('click', (e) => {
    getData();
});

async function getData() {
    let url = 'https://itunes.apple.com/search?term=' + input.value;
    await fetch(url)
        .then(data => data.json())
        .then(json => {
            let finalHTML = ''
            json.results.forEach(song => {
                finalHTML +=
                    //cards from Materializecss//
                    `    <div id="results">
                      <div id="cards" class="col s3 m3 l3">  
                        <div class="card">
                        <div class="card-image waves-effect waves-block waves-light">
                            <img id="art" class="activator" src="${song.artworkUrl100}">
                        </div>
                        <div class="card-content">
                            <span class="card-title activator grey-text text-darken-4">${song.trackName}<i class="material-icons right">more_vert</i></span>
                            <p>${song.artistName}</p>
                        </div>
                        <div class="card-reveal">
                            <span class="card-title grey-text text-darken-4">${song.trackName}<i class="material-icons right">close</i></span>
                            <p>Album: ${song.collectionName}</p>
                            <p>Genre: ${song.primaryGenreName}</p>
                            <p>Release date: ${song.releaseDate}</p>
                        </div>
                        </div>
                        </div>
                        </div>
                         `
            })
            output.innerHTML = finalHTML;
        })
        .catch(error => console.log(error));
};