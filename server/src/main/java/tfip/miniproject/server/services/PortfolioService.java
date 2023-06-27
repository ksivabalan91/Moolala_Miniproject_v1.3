package tfip.miniproject.server.services;

import java.io.StringReader;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.bson.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import jakarta.json.Json;
import jakarta.json.JsonArray;
import jakarta.json.JsonReader;
import tfip.miniproject.server.models.CsvExport;
import tfip.miniproject.server.models.DataChart;
import tfip.miniproject.server.models.DataPrice;
import tfip.miniproject.server.models.HoldingLot;
import tfip.miniproject.server.models.LineChartData;
import tfip.miniproject.server.models.Lot;
import tfip.miniproject.server.models.News;
import tfip.miniproject.server.models.Portfolio;
import tfip.miniproject.server.models.Ticker;
import tfip.miniproject.server.models.User;
import tfip.miniproject.server.repositories.LotRepository;
import tfip.miniproject.server.repositories.MongoRepository;
import tfip.miniproject.server.repositories.PortfolioRepository;
import tfip.miniproject.server.repositories.TickerRepository;
import tfip.miniproject.server.repositories.UserRepository;

@Service
public class PortfolioService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PortfolioRepository portfolioRepository;
    @Autowired
    private TickerRepository tickerRepository;
    @Autowired
    private LotRepository lotRepository;
    @Autowired
    private MongoRepository mongoRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    Logger logger = LoggerFactory.getLogger(PortfolioService.class);

    @Value("${tiingo.api.key}")
    private String TIINGO_API_KEY;
    private final String STOCK_PRICE_URL = "https://api.tiingo.com/iex/";
    private final String STOCK_NEWS_URL = "https://api.tiingo.com/tiingo/news";
    private final String STOCK_PRICE_HISTORY_URL = "https://api.tiingo.com/tiingo/daily/";

    public Optional<List<Portfolio>> getAllPortfolios(String userId) {
        List<Portfolio> portfolios = new LinkedList<>();
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            logger.info(userId + " found");
            portfolios = userOpt.get().getPortfolios();
            if (portfolios != null && portfolios.size() > 0) {
                logger.info("retrieving " + userId + " portfolios:" + portfolios.size());
                return Optional.of(portfolios);
            } else {
                logger.error(userId + " has no portfolios");
                return Optional.empty();
            }
        }
        logger.error(userId + "not found");
        return Optional.empty();

    }

    public String getStockPrice(String tickers) {
        RequestEntity<Void> requestEntity = RequestEntity
                .get(STOCK_PRICE_URL + tickers)
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
            logger.info("Stock price retrieved successfully");
            logger.info("Status code: " + statusCode);
        } catch (Exception e) {
            logger.error("Error getting stock price: " + e.getMessage());
        }
        return payload;
    }
    public List<News> getStockNews(String tickers, Integer limit, Integer offset) {
        ObjectMapper mapper = new ObjectMapper();
        List<News> news = new LinkedList<>();
        String url = UriComponentsBuilder.fromUriString(STOCK_NEWS_URL)
            .queryParam("tickers", tickers)
            .queryParam("limit", limit)
            .queryParam("offset", offset)
            .queryParam("source", "reuters.com,cnbc.com,forbes.com,finance.yahoo.com,cnn.com")
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
            logger.info("Stock price retrieved successfully");
            logger.info("Status code: " + statusCode);
            
            news = mapper.readValue(payload, new TypeReference<List<News>>() {});

        } catch (Exception e) {
            logger.error("Error getting stock price: " + e.getMessage());
            return null;
        }
        return news;
    }

    public void updatePortfolios(String userId, List<Portfolio> newPortfolios) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            logger.info(userId + " found");
            User existingUser = userOpt.get();
            List<Portfolio> existingPortfolios = existingUser.getPortfolios();
            existingPortfolios.clear();

            for (Portfolio newPortfolio : newPortfolios) {
                Portfolio existingPortfolio = new Portfolio();
                logger.info("Creating portfolio object for: " + newPortfolio.getPortfolioName());
                existingPortfolio.setPortfolioName(newPortfolio.getPortfolioName());
                existingPortfolio.setNetValue(newPortfolio.getNetValue());
                existingPortfolio.setTotalGain(newPortfolio.getTotalGain());
                existingPortfolio.setTotalGainPercent(newPortfolio.getTotalGainPercent());
                existingPortfolio.setUser(existingUser);

                portfolioRepository.save(existingPortfolio); // Save the portfolio before saving the tickers

                for (Ticker newTicker : newPortfolio.getTickers()) {
                    Ticker existingTicker = new Ticker();
                    logger.info("Creating ticker object for: " + newTicker.getTicker());
                    existingTicker.setTicker(newTicker.getTicker());
                    existingTicker.setTotalShares(newTicker.getTotalShares());
                    existingTicker.setAverageCostPerShare(newTicker.getAverageCostPerShare());
                    existingTicker.setCurrentPrice(newTicker.getCurrentPrice());
                    existingTicker.setMarketValue(newTicker.getMarketValue());
                    existingTicker.setTotalGain(newTicker.getTotalGain());
                    existingTicker.setPortfolio(existingPortfolio); // Set the portfolio for the ticker

                    tickerRepository.save(existingTicker); // Save the ticker before saving the lots

                    for (Lot newLot : newTicker.getLots()) {
                        Lot existingLot = new Lot();
                        // logger.info("Creating lot object");
                        existingLot.setPurchaseDate(newLot.getPurchaseDate());
                        existingLot.setShares(newLot.getShares());
                        existingLot.setCostPerShare(newLot.getCostPerShare());
                        existingLot.setMarketValue(newLot.getMarketValue());
                        existingLot.setTotalGain(newLot.getTotalGain());
                        existingLot.setTicker(existingTicker); // Set the ticker for the lot

                        lotRepository.save(existingLot);
                        existingTicker.getLots().add(existingLot);
                    }
                    existingPortfolio.getTickers().add(existingTicker);
                }
                existingUser.getPortfolios().add(existingPortfolio);
            }
            userRepository.save(existingUser);
            logger.info(userId + " portfolios updated");
        } else {
            logger.info(userId + "not found");
            logger.info("Creating new user");

            User newUser = new User();
            newUser.setId(userId);
            newUser.setUsername(userId + "@gmail.com");

            userRepository.save(newUser);

            Portfolio newPortfolio = new Portfolio();
            newPortfolio.setPortfolioName(newPortfolios.get(0).getPortfolioName());
            newPortfolio.setUser(newUser);

            newUser.getPortfolios().add(newPortfolio);

            portfolioRepository.save(newPortfolio); // Save the portfolio before saving the tickers
            userRepository.save(newUser);
            logger.info("New user " + userId + " created");
        }
    }

    public Map<String, Map<LocalDate, Float>> consolidateHistoricalDataMap(List<String> tickers) {
        LocalDate startDate = LocalDate.now().minusYears(3);
        Map<String, Map<LocalDate, Float>> consolidatedHistoricalData = new HashMap<>();
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());

        if (tickers.size() > 0) {
            logger.info("Consolidated portfolio retrieved successfully");
            logger.info("Number of tickers: " + tickers.size());
            logger.info("Start date: " + startDate.toString());
            logger.info("End date: " + LocalDate.now().toString());

            for (String ticker : tickers) {
                String url = UriComponentsBuilder.fromUriString(STOCK_PRICE_HISTORY_URL + ticker.trim() + "/prices")
                        .queryParam("startDate", startDate.toString())
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
                List<DataPrice> dataPrice = new LinkedList<>();
                Map<LocalDate, Float> dataPriceMap = new HashMap<>();
                try {
                    response = restTemplate.exchange(requestEntity, String.class);
                    payload = response.getBody();
                    statusCode = response.getStatusCode().value();
                    logger.info(ticker + " history retrieved successfully");
                    logger.info("Status code: " + statusCode);
                    dataPrice = mapper.readValue(payload, new TypeReference<List<DataPrice>>() {
                    });
                    // todo add latest data (completed)
                    String latestprice = getStockPrice(ticker);
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
                } catch (Exception e) {
                    logger.error("Error getting historical price: " + e.getMessage());
                    return null;
                }
                consolidatedHistoricalData.put(ticker, dataPriceMap);
            }
            return consolidatedHistoricalData;
        }
        logger.info("No tickers found");
        return null;
    }

    public Map<String, Map<LocalDate, HoldingLot>> consolidateTickersMap(List<Portfolio> portfolios) {
        Map<String, Map<LocalDate, HoldingLot>> consolidatedTickers = new HashMap<>();
        if (portfolios.size() > 0) {
            for (Portfolio portfolio : portfolios) {
                for (Ticker ticker : portfolio.getTickers()) {
                    for (Lot lot : ticker.getLots()) {
                        if (consolidatedTickers.containsKey(ticker.getTicker())) {
                            Map<LocalDate, HoldingLot> consolidatedLots = consolidatedTickers.get(ticker.getTicker());
                            if (consolidatedLots.containsKey(lot.getPurchaseDate().toLocalDate())) {
                                HoldingLot holdingLot = consolidatedLots.get(lot.getPurchaseDate().toLocalDate());
                                holdingLot.setShares(holdingLot.getShares() + lot.getShares());
                                holdingLot.setCost(holdingLot.getCost() + (lot.getCostPerShare() * lot.getShares()));
                            } else {
                                HoldingLot mapLot = new HoldingLot();
                                mapLot.setShares(lot.getShares());
                                mapLot.setCost(lot.getCostPerShare() * lot.getShares());
                                consolidatedLots.put(lot.getPurchaseDate().toLocalDate(), mapLot);
                            }
                        } else {
                            Map<LocalDate, HoldingLot> consolidatedLots = new HashMap<>();
                            HoldingLot mapLot = new HoldingLot();
                            mapLot.setShares(lot.getShares());
                            mapLot.setCost(lot.getCostPerShare() * lot.getShares());
                            consolidatedLots.put(lot.getPurchaseDate().toLocalDate(), mapLot);
                            consolidatedTickers.put(ticker.getTicker(), consolidatedLots);
                        }
                    }

                }
            }
            return consolidatedTickers;
        }
        return null;
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

        for (LocalDate date : consolidatedLots.keySet()) {
            if (date.isBefore(startDate)) {
                tempShares += consolidatedLots.get(date).getShares();
                tempCost += consolidatedLots.get(date).getCost();
            }
        }

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

    public Map<LocalDate, DataChart> mergeDataChartMap(Map<LocalDate, DataChart> map1, Map<LocalDate, DataChart> map2) {
        for (Map.Entry<LocalDate, DataChart> entry : map1.entrySet()) {
            LocalDate key = entry.getKey();
            DataChart value1 = entry.getValue();
            DataChart value2 = map2.get(key);

            if (value2 != null) {
                // Merge the data from both maps
                float mergedNetValue = value1.getNetValue() + value2.getNetValue();
                float mergedCost = value1.getCost() + value2.getCost();

                // Update the value in map1 with the merged data
                value1.setNetValue(mergedNetValue);
                value1.setCost(mergedCost);
            }
        }
        return map1;
    }

    public List<LineChartData> mapToList(Map<LocalDate, DataChart> lineChartMap) {
        List<LineChartData> lineChartData = new LinkedList<>();
        for (Map.Entry<LocalDate, DataChart> entry : lineChartMap.entrySet()) {
            LocalDate key = entry.getKey();
            DataChart value = entry.getValue();
            float netValue = value.getNetValue();
            float cost = value.getCost();
            lineChartData.add(new LineChartData(key, netValue, cost));
        }
        return lineChartData;
    }

    public Document updateUserCharts(String userId) {
        Optional<List<Portfolio>> portfoliosOpt = getAllPortfolios(userId);
        Map<LocalDate, DataChart> lineChartDataMap = new HashMap<>();
        Map<String, List<LineChartData>> consolidatedUserPortfolioCharts = new HashMap<>();

        if (portfoliosOpt.isPresent()) {
            // ! consolidate all tickers and store in a map
            Map<String, Map<LocalDate, HoldingLot>> consolidatedTickers = consolidateTickersMap(portfoliosOpt.get());
            // ! using consolidated ticker, make 1 API call to get historical data for all
            Map<String, Map<LocalDate, Float>> consolidatedHistoricalData = consolidateHistoricalDataMap(
                    new ArrayList<>(consolidatedTickers.keySet()));

            for (Portfolio portfolio : portfoliosOpt.get()) {
                // ! for each portfolio, generate line chart data
                List<Portfolio> portfolioList = new ArrayList<>();
                portfolioList.add(portfolio);
                // ! tickers in a particular portfolio
                Map<String, Map<LocalDate, HoldingLot>> portfolioTickers = consolidateTickersMap(portfolioList);
                Integer counter = 0;
                // ! For each ticker in portfolio, generate line chart data
                for (String ticker : portfolioTickers.keySet()) {
                    Map<LocalDate, HoldingLot> portfolioTicker = portfolioTickers.get(ticker);
                    Map<LocalDate, Float> historicalData = consolidatedHistoricalData.get(ticker);
                    if (counter == 0) {
                        lineChartDataMap = generateLineChartDataMap(historicalData, portfolioTicker);
                        counter++;
                    } else
                        lineChartDataMap = mergeDataChartMap(lineChartDataMap,
                                generateLineChartDataMap(historicalData, portfolioTicker));

                }
                List<LineChartData> lineChartDataList = mapToList(lineChartDataMap);
                Collections.sort(lineChartDataList, Comparator.comparing(LineChartData::getDate));
                consolidatedUserPortfolioCharts.put(portfolio.getPortfolioName(), lineChartDataList);
            }
            Integer counter = 0;
            for (String ticker : consolidatedTickers.keySet()) {
                Map<LocalDate, HoldingLot> portfolioTicker = consolidatedTickers.get(ticker);
                Map<LocalDate, Float> historicalData = consolidatedHistoricalData.get(ticker);
                if (counter == 0) {
                    lineChartDataMap = generateLineChartDataMap(historicalData, portfolioTicker);
                    counter++;
                } else
                    lineChartDataMap = mergeDataChartMap(lineChartDataMap,
                            generateLineChartDataMap(historicalData, portfolioTicker));
            }

            List<LineChartData> lineChartDataList = mapToList(lineChartDataMap);
            Collections.sort(lineChartDataList, Comparator.comparing(LineChartData::getDate));
            consolidatedUserPortfolioCharts.put("NAV", lineChartDataList);
            return mongoRepository.updateUserCharts(userId, consolidatedUserPortfolioCharts);
        }

        return null;

    }

    public Document findUserChartsById(String userId) {
        return mongoRepository.findUserChartsById(userId);
    }

    public List<CsvExport> downloadCSV(String userId, String portfolioName) {

        String sql = "SELECT p.portfolio_name, t.ticker, t.total_shares, t.average_cost_per_share, l.purchase_date, " +
                "l.shares as shares_purchased, l.cost_per_share, t.current_price, l.market_value " +
                "FROM user u " +
                "LEFT JOIN portfolio p ON u.id = p.user_id " +
                "LEFT JOIN ticker t ON p.id = t.portfolio_id " +
                "LEFT JOIN lot l ON t.id = l.ticker_id " +
                "WHERE u.id = ? AND p.portfolio_name = ?";

        List<CsvExport> csvList = jdbcTemplate.query(sql, BeanPropertyRowMapper.newInstance(CsvExport.class), userId,
                portfolioName);

        return csvList;
    }

    public List<CsvExport> downloadCSV(String userId) {
        System.out.println(userId);

        String sql = "SELECT p.portfolio_name, t.ticker, t.total_shares, t.average_cost_per_share, l.purchase_date, " +
                "l.shares as shares_purchased, l.cost_per_share, t.current_price, l.market_value " +
                "FROM user u " +
                "LEFT JOIN portfolio p ON u.id = p.user_id " +
                "LEFT JOIN ticker t ON p.id = t.portfolio_id " +
                "LEFT JOIN lot l ON t.id = l.ticker_id " +
                "WHERE u.id = ?";

        List<CsvExport> csvList = jdbcTemplate.query(sql, BeanPropertyRowMapper.newInstance(CsvExport.class), userId);

        return csvList;
    }
}