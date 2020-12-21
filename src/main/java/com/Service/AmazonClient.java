package Service;

import com.amazonaws.auth.AWSCredentials;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.services.s3.model.Bucket;
import com.amazonaws.services.s3.model.CannedAccessControlList;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3Client;
import com.amazonaws.services.s3.model.DeleteObjectRequest;
import com.amazonaws.services.s3.model.PutObjectRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.PostConstruct;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Date;
import java.util.List;

@Service
public class AmazonClient {
    private AmazonS3 s3client;

    @Value("${amazonProperties.endpointUrl}")
    private String endpointUrl;
    @Value("${amazonProperties.bucketName}")
    private String bucketName;
    @Value("${amazonProperties.accessKey}")
    private String accessKey;
    @Value("${amazonProperties.secretKey}")
    private String secretKey;
    @PostConstruct
    /*
    This method sets amazon credentials to amazon client with the inputted access key and secret key
    given by the user creation within aws website
     */
    private void initializeAmazon() {
        AWSCredentials credentials = new BasicAWSCredentials(this.accessKey, this.secretKey);
        this.s3client = new AmazonS3Client(credentials);
    }

    /*
    S3 Bucket uploading method requires File as a parameter but we have MultipartFile,
    so we need to add a method which can make this convertion.
     */
    private File convertMultiPartToFile(MultipartFile file) throws IOException, FileNotFoundException {
        File convFile = new File(file.getOriginalFilename());
        FileOutputStream fos = new FileOutputStream(convFile);
        fos.write(file.getBytes());
        fos.close();
        return convFile;
    }
    /*
    Generates a unique name since you can upload the same file several times
     */
    private String generateFileName(MultipartFile multiPart) {
        return new Date().getTime() + "-" + multiPart.getOriginalFilename().replace(" ", "_");
    }
    /*
    Uploads file to S3 Bucket
    We are adding PublicRead permissions to this file. Meaning that anyone who has the file url can access the file.
    Its a good practice for images only because you probably will display these images on your web/ app so you want
    to be sure that each user can see them.
     */
    private void uploadFileTos3bucket(String fileName, File file) {
        s3client.putObject(new PutObjectRequest(bucketName, fileName, file)
                .withCannedAcl(CannedAccessControlList.PublicRead));
    }
    public List<Bucket> getBuckets(){
        return s3client.listBuckets();
    }

    /*
    Final method here which will combine all above methods into one general which will be called from our controller.
    This method will save a file to S3 bucket and return fileUrl which you can store to database. An ecample would be
    that we can attach this url to users model if its a profile image.
     */
    public String uploadFile(MultipartFile multipartFile) {

        String fileUrl = "";
        try {
            File file = convertMultiPartToFile(multipartFile);
            String fileName = generateFileName(multipartFile);
            fileUrl = endpointUrl + "/" + bucketName + "/" + fileName;
            uploadFileTos3bucket(fileName, file);
            file.delete();
        } catch (Exception e) {
            e.printStackTrace();
        }
        return fileUrl;
    }
    /*
    Deletes file
    S3 Bucket cannot delete file by url. It requires a bucket name and a file name
    therefore we have to retrieve file name from url.
     */
    public String deleteFileFromS3Bucket(String fileUrl) {
        String fileName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
        s3client.deleteObject(new DeleteObjectRequest(bucketName + "/", fileName));
        return "Successfully deleted";
    }
}
