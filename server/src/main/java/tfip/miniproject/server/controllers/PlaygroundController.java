package tfip.miniproject.server.controllers;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import tfip.miniproject.server.Utils;
import tfip.miniproject.server.models.DCA;
import tfip.miniproject.server.models.LineChartData;
import tfip.miniproject.server.services.PlaygroundService;

@RestController
@RequestMapping(path = "/api")
public class PlaygroundController {
    Logger logger = LoggerFactory.getLogger(PlaygroundController.class);

    @Autowired
    private PlaygroundService playgroundSvc;

    @PostMapping(path = "getDcaChart", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getallportfolios(@RequestBody DCA dca) {
        logger.info("generating DCA chart for ticker" + dca.getTicker());
        
        List<LineChartData> dcaChart = playgroundSvc.generateDCALineChart(dca);

        if (!dcaChart.isEmpty()) {
            String payload = Utils.toJsonStr(dcaChart);
            return ResponseEntity.ok().body(payload);
        }

        return ResponseEntity.notFound().build();
    }

}
