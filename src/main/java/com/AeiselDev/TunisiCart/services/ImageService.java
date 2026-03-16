package com.AeiselDev.TunisiCart.services;

import com.AeiselDev.TunisiCart.entities.Image;
import com.AeiselDev.TunisiCart.entities.Item;
import com.AeiselDev.TunisiCart.entities.User;
import com.AeiselDev.TunisiCart.repositories.ImageRepository;
import com.AeiselDev.TunisiCart.repositories.ItemRepository;
import com.AeiselDev.TunisiCart.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Optional;
import java.util.zip.DataFormatException;
import java.util.zip.Deflater;
import java.util.zip.Inflater;

@Service
@RequiredArgsConstructor
public class ImageService {

    private final UserRepository userRepository;
    private final ImageRepository imageRepository;
    private final ItemRepository itemRepository;

    public ResponseEntity<String> uploadImage(MultipartFile file, Long idUser) throws IOException {
        Optional<User> userOptional = userRepository.findById(idUser);

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (user.getProfileImage() != null) {
                return ResponseEntity.badRequest().body("User already has an image");
            }
            Image img = new Image();
            img.setFileName(file.getOriginalFilename());
            img.setData(compressBytes(file.getBytes()));
            img.setUser(user);
            imageRepository.save(img);
            return ResponseEntity.ok("Image (" + img.getFileName() + ") added to user with ID:" + img.getUser().getId());
        } else {
            return ResponseEntity.notFound().build();
        }
    }


    public ResponseEntity<String> uploadItemImage(MultipartFile file, Long itemId) throws IOException {
        Optional<Item> itemOptional = itemRepository.findById(itemId);

        if (itemOptional.isPresent()) {
            Item item = itemOptional.get();
            if (item.getItemImage() != null) {
                return ResponseEntity.badRequest().body("Item already has an image");
            }
            Image img = new Image();
            img.setFileName(file.getOriginalFilename());
            img.setData(compressBytes(file.getBytes()));
            img.setItem(item);
            imageRepository.save(img);
            return ResponseEntity.ok("Image (" + img.getFileName() + ") added to item with ID:" + img.getItem().getId());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    public ResponseEntity<byte[]> getImage(Long idUser) {
        Optional<Image> retrievedImage = imageRepository.findByUserId(idUser);
        if (retrievedImage.isPresent()) {
            Image img = retrievedImage.get();
            img.setData(decompressBytes(img.getData()));
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_JPEG); // Adjust as needed
            return new ResponseEntity<>(img.getData(), headers, HttpStatus.OK);
        } else {
            return ResponseEntity.notFound().build();
        }
    }


    public ResponseEntity<byte[]> getItemImage(Long itemId) {
        Optional<Image> retrievedImage = imageRepository.findByItemId(itemId);
        if (retrievedImage.isPresent()) {
            Image img = retrievedImage.get();
            img.setData(decompressBytes(img.getData()));
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_JPEG); // Adjust as needed
            return new ResponseEntity<>(img.getData(), headers, HttpStatus.OK);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    public ResponseEntity<String> updateImage(MultipartFile file, Long idUser) throws IOException {
        Optional<User> userOptional = userRepository.findById(idUser);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            Image image = user.getProfileImage();
            if (image != null) {
                image.setFileName(file.getOriginalFilename());
                image.setData(compressBytes(file.getBytes()));
                imageRepository.save(image);
                return ResponseEntity.ok("Image updated successfully");
            } else {
                return ResponseEntity.notFound().build();
            }
        } else {
            return ResponseEntity.notFound().build();
        }
    }


    public ResponseEntity<String> updateItemImage(MultipartFile file, Long itemId) throws IOException {
        Optional<Item> itemOptional = itemRepository.findById(itemId);
        if (itemOptional.isPresent()) {
            Item item = itemOptional.get();
            Image image = item.getItemImage();
            if (image != null) {
                image.setFileName(file.getOriginalFilename());
                image.setData(compressBytes(file.getBytes()));
                imageRepository.save(image);
                return ResponseEntity.ok("Image updated successfully");
            } else {
                return ResponseEntity.notFound().build();
            }
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    public ResponseEntity<String> deleteImage(Long idUser) {
        Optional<User> userOptional = userRepository.findById(idUser);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            Image image = user.getProfileImage();
            if (image != null) {
                imageRepository.delete(image);
                return ResponseEntity.ok("Image deleted for user: " + idUser);
            } else {
                return ResponseEntity.notFound().build();
            }
        } else {
            return ResponseEntity.notFound().build();
        }
    }


    public ResponseEntity<String> deleteItemImage(Long idItem) {
        Optional<Item> itemOptional = itemRepository.findById(idItem);
        if (itemOptional.isPresent()) {
            Item item = itemOptional.get();
            Image image = item.getItemImage();
            if (image != null) {
                imageRepository.delete(image);
                return ResponseEntity.ok("Image deleted for item: " + idItem);
            } else {
                return ResponseEntity.notFound().build();
            }
        } else {
            return ResponseEntity.notFound().build();
        }
    }


    // Compress the image bytes before storing it in the database
    public static byte[] compressBytes(byte[] data) {
        Deflater deflater = new Deflater();
        deflater.setInput(data);
        deflater.finish();

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream(data.length);
        byte[] buffer = new byte[1024];
        while (!deflater.finished()) {
            int count = deflater.deflate(buffer);
            outputStream.write(buffer, 0, count);
        }
        try {
            outputStream.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
        System.out.println("Compressed Image Byte Size - " + outputStream.toByteArray().length);

        return outputStream.toByteArray();
    }

    // Uncompress the image bytes before returning it to the client
    public static byte[] decompressBytes(byte[] data) {
        Inflater inflater = new Inflater();
        inflater.setInput(data);
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream(data.length);
        byte[] buffer = new byte[1024];
        try {
            while (!inflater.finished()) {
                int count = inflater.inflate(buffer);
                outputStream.write(buffer, 0, count);
            }
            outputStream.close();
        } catch (IOException | DataFormatException e) {
            e.printStackTrace();
        }
        return outputStream.toByteArray();
    }
}
