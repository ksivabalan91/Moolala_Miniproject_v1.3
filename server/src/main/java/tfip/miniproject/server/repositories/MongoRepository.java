package tfip.miniproject.server.repositories;

import java.util.List;
import java.util.Map;

import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Repository;

import tfip.miniproject.server.models.LineChartData;

@Repository
public class MongoRepository {
    @Autowired
    private MongoTemplate mongoTemplate;

    private static final String COLLECTION_NAME = "portfolios";

    public Document updateUserCharts(String uid, Map<String, List<LineChartData>> consolidatedUserPortfolioCharts) {
        
        Query query = new Query(Criteria.where("_id").is(uid));
        Update update = new Update();
        
        update.set("_id", uid);
        update.set("charts", consolidatedUserPortfolioCharts);
        
        FindAndModifyOptions options = new FindAndModifyOptions().upsert(true).returnNew(true);

        return mongoTemplate.findAndModify(query, update, options, Document.class, COLLECTION_NAME);
    }
    
    public Document findUserChartsById(String uid) {
        return mongoTemplate.findById(uid, Document.class, COLLECTION_NAME);
    }

}
