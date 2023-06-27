package tfip.miniproject.server.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import tfip.miniproject.server.models.Portfolio;

public interface PortfolioRepository extends JpaRepository<Portfolio, Long>{
    
}
