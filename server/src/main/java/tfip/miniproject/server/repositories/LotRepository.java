package tfip.miniproject.server.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import tfip.miniproject.server.models.Lot;

public interface LotRepository extends JpaRepository<Lot, Long> {
    
}
