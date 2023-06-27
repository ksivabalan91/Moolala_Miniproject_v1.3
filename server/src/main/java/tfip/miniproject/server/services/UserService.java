package tfip.miniproject.server.services;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import tfip.miniproject.server.models.Feedback;
import tfip.miniproject.server.models.User;
import tfip.miniproject.server.repositories.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JavaMailSender mailSender;

    public User createNewUser(User user) {
        User createdUser = userRepository.save(user);
        return createdUser;
    }

    public Optional<User> updateUsername(User user) {
        Optional<User> userOpt = userRepository.findById(user.getId());
        if (userOpt.isPresent()) {
            User userToUpdate = userOpt.get();
            userToUpdate.setUsername(user.getUsername());
            User updatedUser = userRepository.save(userToUpdate);
            return Optional.of(updatedUser);
        }
        return Optional.empty();
    }

    public String postfeedback(Feedback feedback) {
        System.out.println(feedback.toString());
        Optional<User> userOpt = userRepository.findById(feedback.getUserId());

        // ! send feedback recieved confirmation email to user
        if (userOpt.isPresent()) {
            User userToUpdate = userOpt.get();
            SimpleMailMessage message = new SimpleMailMessage();
            String msgBody = "Dear " + userToUpdate.getUsername()
                    + ",\n\nThank you for the your valuable feedback. We will continue working hard to improve our user experience.\n\nYour feedback:\nCategory: "
                    + feedback.getCategory() + ", " + feedback.getComments() + "\n\nBest Regards,\nMoolala Team";

            message.setFrom("moolala.online@gmail.com");
            message.setTo(userToUpdate.getEmail());
            message.setSubject("Feedback Recieved");
            message.setText(msgBody);
            mailSender.send(message);

            // ! Send feedback to developer incharge
            SimpleMailMessage messageDev = new SimpleMailMessage();

            messageDev.setFrom("moolala.online@gmail.com");
            messageDev.setTo("ksivabalan.91@gmail.com");
            messageDev.setSubject("Feedback recieved: " + feedback.getCategory());
            messageDev.setText("Feedback for category: " + feedback.getCategory() + ",\n\nFrom user: "
                    + userToUpdate.getEmail() + ":\n\n" + feedback.getComments());
            mailSender.send(messageDev);

            return "email sent";
        }
        return null;

    }

}
