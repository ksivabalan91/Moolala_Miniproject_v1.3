package tfip.miniproject.server.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import tfip.miniproject.server.models.User;

public interface UserRepository extends JpaRepository<User, String> {

}
