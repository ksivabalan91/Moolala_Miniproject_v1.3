-- User Table
CREATE TABLE user (
    id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    date_created TIMESTAMP NOT NULL
);

-- Portfolio Table
CREATE TABLE portfolio (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    portfolio_name VARCHAR(255),
    net_value FLOAT,
    total_gain FLOAT,
    total_gain_percent FLOAT,
    user_id VARCHAR(255), -- Foreign key to User
    FOREIGN KEY (user_id) REFERENCES user(id)
);

-- Ticker Table
CREATE TABLE ticker (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ticker VARCHAR(255) NOT NULL,
    is_crypto BOOLEAN DEFAULT FALSE,
    price_currency VARCHAR(255) DEFAULT 'USD',
    total_shares FLOAT,
    average_cost_per_share FLOAT,
    current_price FLOAT,
    market_value FLOAT,
    total_gain FLOAT,
    portfolio_id BIGINT, -- Foreign key to Portfolio
    FOREIGN KEY (portfolio_id) REFERENCES portfolio(id)
);

-- Lot Table
CREATE TABLE lot (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    purchase_date TIMESTAMP NOT NULL,
    shares FLOAT,
    cost_per_share FLOAT,
    market_value FLOAT,
    total_gain FLOAT,
    ticker_id BIGINT, -- Foreign key to Ticker
    FOREIGN KEY (ticker_id) REFERENCES ticker(id)
);
