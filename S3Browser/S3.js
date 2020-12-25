const albumBucketName = "photosharingtestbucket";
const bucketRegion = "us-west-2";
const IdentityPoolId = "us-west-2:ef7b33ab-dd80-4e4e-9ed6-35c63988c43a";

AWS.config.update({
    region: bucketRegion,
    credentials: new AWS.CognitoIdentityCredentials({
        IdentityPoolId: IdentityPoolId
    })
});

const s3 = new AWS.S3({
    apiVersion: "2006-03-01",
    params: {Bucket: albumBucketName}
});

function listAlbums() {
    s3.listObjects({Bucket: albumBucketName, Delimiter: "/"}, function (err, data) {
        if (err) {
            return alert("There was an error listing your albums: " + err.message);
        } else {
            let albums = data.CommonPrefixes.map(function (commonPrefix) {
                let prefix = commonPrefix.Prefix;
                let albumName = decodeURIComponent(prefix.replace("/", ""));
                return getHtml([
                    "<li>",
                    "<span onclick=\"deleteAlbum('" + albumName + "')\">X</span>",
                    "<span onclick=\"viewAlbum('" + albumName + "')\">",
                    albumName,
                    "</span>",
                    "</li>"
                ]);
            });
            let message = albums.length
                ? getHtml([
                    "<p>Click on an album name to view it.</p>",
                    "<p>Click on the X to delete the album.</p>"
                ])
                : "<p>You do not have any albums. Please Create album.";
            let htmlTemplate = [
                "<h2>Albums</h2>",
                message,
                "<ul>",
                getHtml(albums),
                "</ul>",
                "<button onclick=\"createAlbum(prompt('Enter Album Name:'))\">",
                "Create New Album",
                "</button>"
            ];
            document.getElementById("app").innerHTML = getHtml(htmlTemplate);
        }
    });
}

function createAlbum(albumName) {
    albumName = albumName.trim();
    if (!albumName) {
        return alert("Album names must contain at least one non-space character.");
    }
    if (albumName.indexOf("/") !== -1) {
        return alert("Album names cannot contain slashes.");
    } else if (albumName.indexOf(" ") !== -1) {
        return alert("Album names cannot contain spaces");
    }
    let albumKey = encodeURIComponent(albumName);
    s3.headObject({ Bucket: albumBucketName, Key: albumKey }, function (err) {
        if (!err) {
            return alert("Album already exists.");
        }
        if (err.code !== "NotFound") {
            return alert("There was an error creating your album: " + err.message);
        }
        alert("Successfully created album.");
        viewAlbum(albumName);
   });
}

function viewAlbum(albumName) {
    let albumPhotosKey = encodeURIComponent(albumName) + "/";
    s3.listObjects({ Bucket: albumBucketName, Prefix: albumPhotosKey }, function (err, data) {
        if (err) {
            return alert("There was an error viewing your album: " + err.message);
        }
        // 'this' references the AWS.Response instance that represents the response
        let href = this.request.httpRequest.endpoint.href;
        let bucketUrl = href + albumBucketName + "/";

        let photos = data.Contents.map(function (photo) {
            let photoKey = photo.Key;
            let photoUrl = bucketUrl + encodeURIComponent(photoKey);
            console.log(photoKey);

            return getHtml([
                "<span>",
                "<div>",
                '<img style="width:25%;height:25%;" src="' + photoUrl + '" alt=""/>',
                "</div>",
                "<div>",
                "<span onclick=\"deletePhoto('" +
                albumName +
                "','" +
                photoKey +
                "')\">",
                "X",
                "</span>",
                "<button onclick=\"downloadPhoto('" +
                photoUrl +
                "','" +
                photoKey +
                "')\">",
                "Download",
                "</button>",
                "<span>",
                photoKey.replace(albumPhotosKey, ""),
                "</span>",
                "</div>",
                "</span>",
                "<br>"
            ]);
        });
        let message = photos.length
            ? "<p>Click on the X to delete the photo.</p><p>Click Download to download the photo.</p>"
            : "<p>You do not have any photos in this album. Please add photos to save the album.</p>";
        let htmlTemplate = [
            "<h2>",
            "Album: " + albumName,
            "</h2>",
            message,
            "<div>",
            getHtml(photos),
            "</div>",
            '<input id="photoupload" type="file" accept="image/*">',
            '<button id="addphoto" onclick="addPhoto(\'' + albumName + "')\">",
            "Add Photo",
            "</button>",
            '<button onclick="listAlbums()">',
            "Back To Albums",
            "</button>"
        ];
        document.getElementById("app").innerHTML = getHtml(htmlTemplate);
    });
}

function addPhoto(albumName) {
    let files = document.getElementById("photoupload").files;
    if (!files.length) {
        return alert("Please choose a file to upload first.");
    }
    let file = files[0];
    let fileName = file.name;
    let albumPhotosKey = encodeURIComponent(albumName) + "/";

    let photoKey = albumPhotosKey + fileName;

    // Use S3 ManagedUpload class as it supports multipart uploads
    let upload = new AWS.S3.ManagedUpload({
        params: {
            Bucket: albumBucketName,
            Key: photoKey,
            Body: file,
            ACL: "public-read"
        }
    });

    let promise = upload.promise();

    promise.then(
        function () {
            alert("Successfully uploaded photo.");
            viewAlbum(albumName);
        },
        function (err) {
            return alert("There was an error uploading your photo: " + err.message);
        }
    );
}

function deletePhoto(albumName, photoKey) {
    s3.deleteObject({Bucket: albumBucketName, Key: photoKey}, function (err) {
        if (err) {
            return alert("There was an error deleting your photo: " + err.message);
        }
        alert("Successfully deleted photo.");
        viewAlbum(albumName);
    });
}

function deleteAlbum(albumName) {
    let albumKey = encodeURIComponent(albumName) + "/";
    s3.listObjects({Bucket: albumBucketName, Prefix: albumKey}, function (err, data) {
        if (err) {
            return alert("There was an error deleting your album: " + err.message);
        }
        let objects = data.Contents.map(function (object) {
            return {Key: object.Key};
        });
        s3.deleteObjects(
            {
                Bucket: albumBucketName,
                Delete: {Objects: objects, Quiet: true}
            },
            function (err) {
                if (err) {
                    return alert("There was an error deleting your album: " + err.message);
                }
                alert("Successfully deleted album.");
                listAlbums();
            }
        );
    });
}

function downloadPhoto(photoUrl, photoKey) {
    let fileName = photoKey.substring(photoKey.lastIndexOf("/") + 1);
    console.log(fileName);
    const proxyurl = "https://cors-anywhere.herokuapp.com/";
    fetch(proxyurl + photoUrl)
        .then(resp => resp.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            // the filename you want
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            alert('Your file has downloaded!'); // or you know, something with better UX...
        })
        .catch(error => {
            alert('Photo could not be downloaded: ' + error.message);
        });
}
