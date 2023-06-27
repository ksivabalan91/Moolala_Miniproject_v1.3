package tfip.miniproject.server.models;

import java.sql.Date;
import java.util.LinkedList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table (name="user")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class User {
    
    @Id
    @Column(name = "id")
    private String id;
    @Column(name = "username")
    private String username="";
    @Column(name = "email")
    private String email="";
    @Column (name = "date_created")
    private Date dateCreated = new Date(System.currentTimeMillis());;

    @OneToMany(mappedBy = "user", targetEntity = Portfolio.class, cascade = CascadeType.ALL, fetch = FetchType.EAGER,orphanRemoval = true )
    List<Portfolio> portfolios = new LinkedList<>();
    
}
