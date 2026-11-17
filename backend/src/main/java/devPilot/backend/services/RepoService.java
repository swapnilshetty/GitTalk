package devPilot.backend.services;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import devPilot.backend.dto.IndexStatusResponse;
import devPilot.backend.dto.RepositoryResponse;
import devPilot.backend.entity.Repositories;
import devPilot.backend.entity.User;
import devPilot.backend.exceptions.NotFoundException;
import devPilot.backend.repository.RepositoryRepository;
import devPilot.backend.services.github.GithubApiClient;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RepoService {

    private final RepositoryRepository repositoryRepository;
    private final UserService userService;
    private final GithubApiClient githubApiClient;

    @Transactional
    public List<RepositoryResponse> syncAndListRepo(UUID userId) {
        User user = userService.requiredById(userId);
        String accessToken = userService.decryptAccessToken(user);
        List<Map<String, Object>> remoteRepositories =
                githubApiClient.listUserRepos(accessToken);

        List<Repositories> savedRepositories = new ArrayList<>();

        for (Map<String, Object> remote : remoteRepositories) {
            Long githubRepoId = toLong(remote.get("id"));
            if (githubRepoId == null) {
                continue;
            }

            Repositories repository = repositoryRepository
                    .findByUserIdAndGithubRepoId(userId, githubRepoId)
                    .orElseGet(Repositories::new);

            String fullName = String.valueOf(remote.get("full_name"));
            String[] nameParts = fullName.split("/", 2);
            Map<?, ?> ownerInfo = remote.get("owner") instanceof Map<?, ?> map
                    ? map
                    : Map.of();
            Object ownerLogin = ownerInfo.get("login");
            String owner = nameParts.length > 0 && !nameParts[0].isBlank()
                    ? nameParts[0]
                    : ownerLogin != null ? String.valueOf(ownerLogin) : "";

            repository.setUserId(userId);
            repository.setGithubRepoId(githubRepoId);
            repository.setOwner(owner);
            repository.setName(nameParts.length > 1
                    ? nameParts[1]
                    : String.valueOf(remote.getOrDefault("name", "")));
            repository.setFullName(fullName);
            repository.setPrivate(Boolean.TRUE.equals(remote.get("private")));
            repository.setDefaultBranch(remote.get("default_branch") != null
                    ? String.valueOf(remote.get("default_branch"))
                    : "main");
            repository.setLanguage(remote.get("language") != null
                    ? String.valueOf(remote.get("language"))
                    : null);
            repository.setHtmlUrl(remote.get("html_url") != null
                    ? String.valueOf(remote.get("html_url"))
                    : null);
            repository.setDescription(remote.get("description") != null
                    ? String.valueOf(remote.get("description"))
                    : null);
            repository.setUpdatedAt(Instant.now());

            savedRepositories.add(repositoryRepository.save(repository));
        }

        return savedRepositories.stream()
                .sorted((a,b) -> a.getFullName().compareToIgnoreCase(b.getFullName()))
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RepositoryResponse> listStored(UUID userId) {
        return repositoryRepository.findByUserIdOrderByFullNameAsc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RepositoryResponse> listByUserId(UUID userId) {
        return listStored(userId);
    }

    @Transactional(readOnly = true)
    public Repositories requireOwned(UUID repoId, UUID userId) {
        return repositoryRepository.findByIdAndUserId(repoId, userId)
                .orElseThrow(() -> new NotFoundException("Repository not found"));
    }

    @Transactional(readOnly = true)
    public IndexStatusResponse status(UUID repoId, UUID userId) {
        Repositories repository = requireOwned(repoId, userId);
        return new IndexStatusResponse(
                repository.getId(),
                repository.getIndexStatus(),
                repository.getFilesTotal(),
                repository.getFilesProcessed(),
                repository.getChunkCount(),
                repository.getIndexedAt(),
                repository.getErrorMessage());
    }

    public RepositoryResponse toResponse(Repositories repository) {
        return RepositoryResponse.from(repository);
    }

    private static Long toLong(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number number) {
            return number.longValue();
        }
        return Long.parseLong(String.valueOf(value));
    }
}
