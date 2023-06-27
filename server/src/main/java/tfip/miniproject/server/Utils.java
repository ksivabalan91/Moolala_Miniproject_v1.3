package tfip.miniproject.server;

import java.io.IOException;
import java.io.StringReader;
import java.io.StringWriter;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.List;

import org.bson.Document;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.opencsv.CSVWriter;

import jakarta.json.Json;
import jakarta.json.JsonArray;
import jakarta.json.JsonObject;
import jakarta.json.JsonReader;
import tfip.miniproject.server.models.CsvExport;

public class Utils {
    public static JsonArray toJsonArray(Object object) {
        ObjectMapper objectMapper = new ObjectMapper();
        DateFormat df = new SimpleDateFormat("yyyy-MM-dd");
        objectMapper.setDateFormat(df);
        objectMapper.registerModule(new JavaTimeModule());
        try {
            String jsonString = objectMapper.writeValueAsString(object);
            JsonReader jsonReader = Json.createReader(new StringReader(jsonString));
            return jsonReader.readArray();

        } catch (JsonProcessingException e) {
            e.printStackTrace();
            JsonArray jsonArr = Json.createArrayBuilder().add("Object notmapped correctly").build();
            return jsonArr;
        }
    }

    public static JsonObject toJsonObject(Object object) {
        ObjectMapper objectMapper = new ObjectMapper();
        DateFormat df = new SimpleDateFormat("yyyy-MM-dd");
        objectMapper.setDateFormat(df);
        objectMapper.registerModule(new JavaTimeModule());
        try {
            String jsonString = objectMapper.writeValueAsString(object);
            JsonReader jsonReader = Json.createReader(new StringReader(jsonString));
            return jsonReader.readObject();

        } catch (JsonProcessingException e) {
            e.printStackTrace();
            JsonObject jsonObject = Json.createObjectBuilder().add("message", "Object not mapped correctly").build();
            return jsonObject;
        }
    }

    public static String toJsonStr(Object object) {
        ObjectMapper objectMapper = new ObjectMapper();
        DateFormat df = new SimpleDateFormat("yyyy-MM-dd");
        objectMapper.setDateFormat(df);
        objectMapper.registerModule(new JavaTimeModule());
        try {
            String jsonString = objectMapper.writeValueAsString(object);
            return jsonString;

        } catch (JsonProcessingException e) {
            e.printStackTrace();
            return null;
        }
    }

    public static JsonObject docToJsonObject(Document doc) {
        String jsonString = doc.toJson();
        JsonReader jsonReader = Json.createReader(new StringReader(jsonString));
        return jsonReader.readObject();
    }

    public static JsonArray docToJsonArray(Document doc) {
        String jsonString = doc.toJson();
        JsonReader jsonReader = Json.createReader(new StringReader(jsonString));
        return jsonReader.readArray();
    }
    public static JsonObject stringToJsonObject(String doc) {
        JsonReader jsonReader = Json.createReader(new StringReader(doc));
        return jsonReader.readObject();
    }

    public static JsonArray stringToJsonArray(String doc) {
        JsonReader jsonReader = Json.createReader(new StringReader(doc));
        return jsonReader.readArray();
    }

    public static JsonArray docToJsonArray(List<Document> docList) {
        String jsonString = docList.toString();
        JsonReader jsonReader = Json.createReader(new StringReader(jsonString));
        return jsonReader.readArray();
    }

    public static String convertToCSV(List<CsvExport> csvList) {
        StringWriter stringWriter = new StringWriter();
        CSVWriter csvWriter = new CSVWriter(stringWriter);

        // Define the CSV header
        String[] header = {
                "Portfolio Name",
                "Ticker",
                "Total Shares",
                "Average Cost Per Share",
                "Purchase Date",
                "Shares Purchased",
                "Cost Per Share",
                "Current Price",
                "Market Value"
        };

        csvWriter.writeNext(header);

        // Write data rows
        for (CsvExport csvExport : csvList) {
            String[] row = {
                    csvExport.getPortfolioName(),
                    csvExport.getTicker(),
                    String.valueOf(csvExport.getTotalShares()),
                    String.valueOf(csvExport.getAverageCostPerShare()),
                    csvExport.getPurchaseDate().toString(),
                    String.valueOf(csvExport.getSharesPurchased()),
                    String.valueOf(csvExport.getCostPerShare()),
                    String.valueOf(csvExport.getCurrentPrice()),
                    String.valueOf(csvExport.getMarketValue())
            };
            csvWriter.writeNext(row);
        }

        try {
            csvWriter.close();
        } catch (IOException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }
        return stringWriter.toString();
    }

}
