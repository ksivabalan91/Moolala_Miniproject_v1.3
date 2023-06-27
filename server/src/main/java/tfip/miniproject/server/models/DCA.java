package tfip.miniproject.server.models;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DCA {
    private String ticker;
    private LocalDate startDate;
    private LocalDate endDate;
    private int investInterval;
    private float investAmount;
    private float initialAmount;
}
