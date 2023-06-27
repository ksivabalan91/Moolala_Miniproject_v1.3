package tfip.miniproject.server.models;

import java.sql.Date;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CsvExport {
    private String portfolioName;
    private String ticker;
    private float totalShares;
    private float averageCostPerShare;
    private Date purchaseDate;
    private float sharesPurchased;
    private float costPerShare;
    private float currentPrice;
    private float marketValue;
}
