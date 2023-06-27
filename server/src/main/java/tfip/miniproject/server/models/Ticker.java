package tfip.miniproject.server.models;

import java.util.LinkedList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name="ticker")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Ticker {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;
    @Column(name = "ticker")
    private String ticker="";
    @Column(name = "is_crypto")
    private Boolean isCrypto=false;
    @Column(name = "price_currency")
    private String priceCurrency="USD";
    @Column(name = "total_shares")
    private float totalShares=0;
    @Column(name = "average_cost_per_share")
    private float averageCostPerShare=0;
    @Column(name = "current_price")
    private float currentPrice=0;
    @Column(name = "market_value")    
    private float marketValue=0;
    @Column(name = "total_gain")
    private float totalGain=0;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "portfolio_id")
    private Portfolio portfolio;

    @OneToMany(mappedBy = "ticker", targetEntity = Lot.class, cascade = CascadeType.ALL,fetch = FetchType.EAGER, orphanRemoval = true)
    private List<Lot> lots = new LinkedList<>();
}
