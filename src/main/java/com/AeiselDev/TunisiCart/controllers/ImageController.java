package com.AeiselDev.TunisiCart.controllers;



import com.AeiselDev.TunisiCart.entities.Image;

import com.AeiselDev.TunisiCart.exception.ApiResponse;
import com.AeiselDev.TunisiCart.services.ImageService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


import java.io.IOException;
import java.util.Objects;

@RestController
@RequestMapping("/image")
@RequiredArgsConstructor
@Tag(name ="Image")
public class ImageController {

    public final ImageService imageService;


    @PostMapping("/user/upload/{idUser}")
    public ResponseEntity<ApiResponse> uploadImage(@RequestParam("imageFile") MultipartFile file, @PathVariable Long idUser) {
        try {
            // Check if the image for the user already exists
            ResponseEntity<byte[]> imageResponse = imageService.getImage(idUser);

            if (imageResponse != null && imageResponse.getBody() != null && imageResponse.getBody().length > 0) {
                // Update existing image
                ResponseEntity<String> response = imageService.updateImage(file, idUser);
                return ResponseEntity.ok(new ApiResponse("Image updated successfully", true, response.getBody()));
            }

            // Upload new image

            ResponseEntity<String> response = imageService.uploadImage(file, idUser);
            return ResponseEntity.ok(new ApiResponse("Image uploaded successfully", true, response.getBody()));

        } catch (IOException e) {
            // Log the exception and return an error response
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse("Failed to process the image upload: " + e.getMessage(), false, null));
        } catch (Exception e) {
            // Catch any other exceptions
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse("An unexpected error occurred: " + e.getMessage(), false, null));
        }
    }


    @PostMapping("/item/upload/{ItemId}")
    public ResponseEntity<ApiResponse> uploadItemImage(@RequestParam("imageFile") MultipartFile file, @PathVariable Long ItemId) {
        try {
            // Check if the image for the item already exists
            ResponseEntity<byte[]> imageResponse = imageService.getItemImage(ItemId);

            if (imageResponse != null && imageResponse.getBody() != null && imageResponse.getBody().length > 0) {
                // Update existing image
                ResponseEntity<String> response = imageService.updateItemImage(file, ItemId);
                return ResponseEntity.ok(new ApiResponse("Image uploaded successfully", true, response.getBody()));
            }

            // Upload new image
            ResponseEntity<String> response = imageService.uploadItemImage(file, ItemId);
            return ResponseEntity.ok(new ApiResponse("Image uploaded successfully", true, response.getBody()));

        } catch (IOException e) {
            // Log the exception and return an error response
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse("Failed to process the image upload: " + e.getMessage(), false, null));
        } catch (Exception e) {
            // Catch any other exceptions
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse("An unexpected error occurred: " + e.getMessage(), false, null));
        }
    }




    @GetMapping("/user/get/{idUser}")
    public ResponseEntity<byte[]> getImageByidUser(@PathVariable Long idUser)
    {
        return imageService.getImage(idUser);


    }



    @GetMapping("/item/get/{idItem}")
    public ResponseEntity<byte[]> getImageByidItem(@PathVariable Long idItem)
    {
        return imageService.getItemImage(idItem);


    }




//    @PutMapping("/update/{idUser}")
//
//    public ResponseEntity<String>updateImage(@RequestParam("imageFile") MultipartFile file,  @PathVariable Long idUser) throws IOException {
//
//        return imageService.updateImage(file,idUser);
//    }



    @DeleteMapping("/user/delete/{idUser}")
    public ResponseEntity<String>deleteImage(@PathVariable Long idUser)
    {
        return imageService.deleteImage(idUser);
    }

    @DeleteMapping("/item/delete/{idItem}")
    public ResponseEntity<String>deleteItemImage(@PathVariable Long idItem)
    {
        return imageService.deleteItemImage(idItem);
    }


}
