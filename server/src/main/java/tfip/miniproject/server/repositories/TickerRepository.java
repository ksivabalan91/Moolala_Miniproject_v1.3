package tfip.miniproject.server.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import tfip.miniproject.server.models.Ticker;

public interface TickerRepository extends JpaRepository<Ticker, Long> {
    
}
