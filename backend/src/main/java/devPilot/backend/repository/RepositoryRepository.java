package devPilot.backend.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import devPilot.backend.entity.Repositories;

public interface RepositoryRepository extends JpaRepository<Repositories, UUID> {

    List<Repositories> findByUserIdOrderByFullNameAsc(UUID userId);

    Optional<Repositories> findByIdAndUserId(UUID id, UUID userId);

    Optional<Repositories> findByUserIdAndGithubRepoId(UUID userId, Long githubRepoId);
}
