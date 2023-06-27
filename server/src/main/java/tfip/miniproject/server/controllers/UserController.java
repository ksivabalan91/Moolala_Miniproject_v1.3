package tfip.miniproject.server.controllers;

import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import tfip.miniproject.server.Utils;
import tfip.miniproject.server.models.Feedback;
import tfip.miniproject.server.models.User;
import tfip.miniproject.server.services.UserService;

@RestController
@RequestMapping(path="/api")
public class UserController {
    Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserService userSvc;

    @PostMapping(path="/createnewuser", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> updateUserPortfolios(@RequestBody User user){
        logger.info("Creating new user: " + user.getUsername());
        User createdUser = userSvc.createNewUser(user);

        if(createdUser != null)
            return ResponseEntity.ok().body(Utils.toJsonStr(createdUser));
        else
            return ResponseEntity.unprocessableEntity().build();
        
    
        } 
    @PutMapping(path="/updateusername", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> updateUsername(@RequestBody User user){
        logger.info("Updating user: " + user.getId());
        Optional<User> updatedUser = userSvc.updateUsername(user);

        if(updatedUser.isPresent())
            return ResponseEntity.ok().body(Utils.toJsonStr(updatedUser.get()));
        else
            return ResponseEntity.unprocessableEntity().build();
        
    } 
    @PostMapping(path="/postfeedback", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> postfeedback(@RequestBody Feedback feedback){
        logger.info("Recieved Feedback for: "+feedback.getCategory());
        String resp = userSvc.postfeedback(feedback);
        if(resp!=null)
            return ResponseEntity.ok().body("Feedback received, email sent");
        else
            return ResponseEntity.status(400).body("User not found");
        
    } 
}
