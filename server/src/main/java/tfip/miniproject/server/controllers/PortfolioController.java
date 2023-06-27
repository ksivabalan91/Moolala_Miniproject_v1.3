package tfip.miniproject.server.controllers;

import java.util.LinkedList;
import java.util.List;
import java.util.Optional;

import org.bson.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.core.JsonProcessingException;

import jakarta.json.JsonObject;
import tfip.miniproject.server.Utils;
import tfip.miniproject.server.models.CsvExport;
import tfip.miniproject.server.models.News;
import tfip.miniproject.server.models.Portfolio;
import tfip.miniproject.server.services.PortfolioService;

@RestController
@RequestMapping(path = "/api")
public class PortfolioController {

    Logger logger = LoggerFactory.getLogger(PortfolioController.class);

    @Autowired
    private PortfolioService portfolioService;

    // ! GET ALL OF USER PORTFOLIOS FROM SQL DB
    @GetMapping(path = "/{userId}/getallportfolios", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getallportfolios(@PathVariable String userId) {
        logger.info("Getting all portfolios called for: " + userId);

        Optional<List<Portfolio>> portfolioOpt = portfolioService.getAllPortfolios(userId);
        if (portfolioOpt.isPresent()) {
            return ResponseEntity.ok().body(Utils.toJsonStr(portfolioOpt.get()));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // ! UPDATE USER PORTFOLIOS IN SQL DB
    @PutMapping(path = "/{userId}/updateportfolios", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> updateUserPortfolios(@PathVariable String userId,
            @RequestBody List<Portfolio> portfolios) {
        logger.info("Updating all portfolios called for: " + userId);
        portfolioService.updatePortfolios(userId, portfolios);
        return ResponseEntity.ok().body("udpated user " + userId + " portfolios");

    }

    // ! API REQUEST FOR LATEST STOCKPRICE
    @GetMapping(path = "stockprice")
    public ResponseEntity<String> getStockPrice(@RequestParam String tickers) {
        logger.info("Getting current stockprices for tickers: " + tickers);
        String payload = portfolioService.getStockPrice(tickers);
        if (payload != null) {
            return ResponseEntity.ok().body(payload);
        }
        return ResponseEntity.notFound().build();
    }

    // ! API REQUEST FOR LATEST STOCK NEWS
    @PostMapping(path = "stocknews")
    public ResponseEntity<String> getStockNews(@RequestBody String request) {
        System.out.println(request);

        JsonObject json = Utils.stringToJsonObject(request);
        logger.info("Getting current news for tickers: " + json.getString("tickers"));
        List<News> payload = portfolioService.getStockNews(json.getString("tickers"), json.getInt("limit"),
                json.getInt("offset"));

        if (payload != null) {
            return ResponseEntity.ok().body(Utils.toJsonStr(payload));
        }
        return ResponseEntity.notFound().build();
    }

    // ! GET ALL USER PORTFOLIO CHART DATA FROM MONGO DB
    @GetMapping(path = "{userId}/getChartData", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getPortfolioChart(@PathVariable String userId) throws JsonProcessingException {
        logger.info("Getting chart data for user: " + userId);
        String payload = Utils.toJsonStr(portfolioService.findUserChartsById(userId));
        if (payload != null) {
            return ResponseEntity.ok().body(payload);
        }
        return ResponseEntity.notFound().build();

    }

    // ! UPDATE ALL USER PORTFOLIO CHART DATA TO MONGO DB
    @PutMapping(path = "/{userId}/updateChartData", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> updateChartData(@PathVariable String userId) {
        logger.info("Updating all chart data for user: " + userId);
        Document bson = portfolioService.updateUserCharts(userId);
        if (bson != null) {
            return ResponseEntity.ok().body("udpated user " + userId + " chartdata");
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping(path = "/{userId}/downloadCSV", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<byte[]> downloadCSV(@PathVariable String userId, @RequestHeader String portfolioName) {
        logger.info("Getting csv data for user: " + userId + " portfolio: " + portfolioName);
        List<CsvExport> csvList = new LinkedList<>();

        if ("all".equalsIgnoreCase(portfolioName)) {
            csvList = portfolioService.downloadCSV(userId);
            if (csvList.size() > 0) {
                String csvData = Utils.convertToCSV(csvList);

                // Prepare the CSV file for download
                byte[] csvBytes = csvData.getBytes();
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
                headers.setContentDispositionFormData("attachment", portfolioName + "_data.csv");

                return new ResponseEntity<>(csvBytes, headers, HttpStatus.OK);
            }

        } else {
            csvList = portfolioService.downloadCSV(userId, portfolioName);
            if (csvList.size() > 0) {
                String csvData = Utils.convertToCSV(csvList);
                // Prepare the CSV file for download
                byte[] csvBytes = csvData.getBytes();
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
                headers.setContentDispositionFormData("attachment", portfolioName + "_data.csv");

                return new ResponseEntity<>(csvBytes, headers, HttpStatus.OK);
            }

        }
        return ResponseEntity.noContent().build();
    }

    // CompletableFuture.runAsync(() -> {});
}
