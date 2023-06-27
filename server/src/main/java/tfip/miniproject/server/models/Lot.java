package tfip.miniproject.server.models;

import java.sql.Date;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name="lot")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Lot {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;
    @Column(name = "purchase_date") 
    private Date purchaseDate = new Date(System.currentTimeMillis());
    @Column(name = "shares") 
    private float shares = 0;
    @Column(name = "cost_per_share")     
    private float costPerShare = 0;
    @Column(name = "market_value") 
    private float marketValue = 0;
    @Column(name = "total_gain") 
    private float totalGain = 0;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "ticker_id")
    private Ticker ticker;    
}
