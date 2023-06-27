package tfip.miniproject.server.models;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LineChartData {
    private LocalDate date;
    private float netValue;
    private float cost;    
}
