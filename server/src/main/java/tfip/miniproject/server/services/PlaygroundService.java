package tfip.miniproject.server.services;

import java.io.StringReader;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import jakarta.json.Json;
import jakarta.json.JsonArray;
import jakarta.json.JsonReader;
import tfip.miniproject.server.models.DCA;
import tfip.miniproject.server.models.DataChart;
import tfip.miniproject.server.models.DataPrice;
import tfip.miniproject.server.models.HoldingLot;
import tfip.miniproject.server.models.LineChartData;

@Service
public class PlaygroundService {

    @Autowired
    private PortfolioService portfolioSvc;

    @Value("${tiingo.api.key}")
    private String TIINGO_API_KEY;

    private final String STOCK_PRICE_HISTORY_URL = "https://api.tiingo.com/tiingo/daily/";

    Logger logger = LoggerFactory.getLogger(PlaygroundService.class);

    public List<LineChartData> generateDCALineChart(DCA dca) {
        
        List<LineChartData> dataList = new LinkedList<>();
        
        Map<LocalDate, Float> historicalPriceMap = consolidateHistoricalData(dca.getTicker(),
                dca.getStartDate().toString(), dca.getEndDate().toString());
        if (historicalPriceMap == null)
            return dataList;
        Map<LocalDate, HoldingLot> consolidatedLots = consolidateLotsData(historicalPriceMap, dca);
        if (consolidatedLots.isEmpty())
            return dataList;
        Map<LocalDate, DataChart> data = generateLineChartDataMap(historicalPriceMap, consolidatedLots);
        if (data.isEmpty())
            return dataList;
        dataList = portfolioSvc.mapToList(data);
        if (dataList.isEmpty())
            return dataList;
        Collections.sort(dataList, Comparator.comparing(LineChartData::getDate));
        return dataList;

    }

    public Map<LocalDate, DataChart> generateLineChartDataMap(Map<LocalDate, Float> historicalData,
            Map<LocalDate, HoldingLot> consolidatedLots) {
        Map<LocalDate, DataChart> lineChartMap = new HashMap<>();

        LocalDate startDate = Collections.min(historicalData.keySet());
        LocalDate endDate = Collections.max(historicalData.keySet());

        float tempShares = 0;
        float tempCost = 0;
        float tempPrice = historicalData.get(startDate);

        LocalDate currentDate = startDate;

        while (!currentDate.isAfter(endDate)) {
            if (consolidatedLots.containsKey(currentDate)) {
                tempShares += consolidatedLots.get(currentDate).getShares();
                tempCost += consolidatedLots.get(currentDate).getCost();
            }
            if (historicalData.containsKey(currentDate)) {
                tempPrice = historicalData.get(currentDate);
                lineChartMap.put(currentDate, new DataChart(tempShares * tempPrice, tempCost));
            } else {
                lineChartMap.put(currentDate, new DataChart(tempShares * tempPrice, tempCost));
            }
            currentDate = currentDate.plusDays(1);
        }
        return lineChartMap;
    }

    public Map<LocalDate, HoldingLot> consolidateLotsData(Map<LocalDate, Float> historicalPriceMap, DCA dca) {
        Map<LocalDate, HoldingLot> consolidatedLots = new HashMap<>();
        LocalDate currentDate = Collections.min(historicalPriceMap.keySet());
        LocalDate endDate = Collections.max(historicalPriceMap.keySet());

        // * create initial investment amount */
        float shares = dca.getInitialAmount() / historicalPriceMap.get(currentDate);
        float cost = dca.getInitialAmount();
        HoldingLot lot = new HoldingLot(shares, cost);
        consolidatedLots.put(currentDate, lot);
        currentDate = currentDate.plusDays(dca.getInvestInterval());

        while (currentDate.isBefore(endDate)) {
            while (historicalPriceMap.get(currentDate) == null) {
                currentDate = currentDate.plusDays(1);
            }
            shares = dca.getInvestAmount() / historicalPriceMap.get(currentDate);
            cost = dca.getInvestAmount();
            lot = new HoldingLot(shares, cost);
            consolidatedLots.put(currentDate, lot);
            currentDate = currentDate.plusDays(dca.getInvestInterval());
        }
        return consolidatedLots;
    }

    public Map<LocalDate, Float> consolidateHistoricalData(String ticker, String startDate, String endDate) {
        List<DataPrice> dataPrice = new LinkedList<>();
        Map<LocalDate, Float> dataPriceMap = new HashMap<>();
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());

        String url = UriComponentsBuilder.fromUriString(STOCK_PRICE_HISTORY_URL + ticker.trim() + "/prices")
                .queryParam("startDate", startDate)
                .queryParam("endDate", endDate)
                .build()
                .toUriString();

        RequestEntity<Void> requestEntity = RequestEntity
                .get(url)
                .header("Authorization", "Token " + TIINGO_API_KEY)
                .accept(MediaType.APPLICATION_JSON)
                .build();

        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> response = null;
        String payload = null;
        int statusCode = 0;
        try {
            response = restTemplate.exchange(requestEntity, String.class);
            payload = response.getBody();
            statusCode = response.getStatusCode().value();
            logger.info(ticker + " history retrieved successfully");
            logger.info("Status code: " + statusCode);
            dataPrice = mapper.readValue(payload, new TypeReference<List<DataPrice>>() {
            });
            String latestprice = portfolioSvc.getStockPrice(ticker);
            JsonReader jsonReader = Json.createReader(new StringReader(latestprice));
            JsonArray latestPriceData = jsonReader.readArray();
            float lastValue = (float) latestPriceData.getJsonObject(0).getJsonNumber("last").doubleValue();
            String timestampStr = latestPriceData.getJsonObject(0).getString("timestamp");
            DateTimeFormatter formatter = DateTimeFormatter.ISO_OFFSET_DATE_TIME;
            LocalDate timestamp = LocalDate.parse(timestampStr, formatter);                    
            dataPrice.add(new DataPrice(timestamp,lastValue));
            for (DataPrice dp : dataPrice) {
                dataPriceMap.put(dp.getDate(), dp.getAdjClose());
            }
            return dataPriceMap;
        } catch (Exception e) {
            logger.error("Error getting historical price: " + e.getMessage());
            return null;
        }
    }
}
