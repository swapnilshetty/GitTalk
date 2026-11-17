package devPilot.backend.services.github;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GithubApiClient {

    private static final String API_BASE = "https://api.github.com";
    private static final int PAGE_SIZE = 100;
    private static final int MAX_PAGES = 10;

    private static final ParameterizedTypeReference<List<Map<String, Object>>> REPOSITORY_LIST =
            new ParameterizedTypeReference<>() {};
    private static final ParameterizedTypeReference<Map<String, Object>> MAP =
            new ParameterizedTypeReference<>() {};

    private final RestClient.Builder restClientBuilder;

    public List<Map<String, Object>> listUserRepos(String accessToken) {
        List<Map<String, Object>> allRepositories = new ArrayList<>();
        RestClient githubClient = client(accessToken);

        for (int page = 1; page <= MAX_PAGES; page++) {
            int currentPage = page;
            List<Map<String, Object>> pageRepositories = githubClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/user/repos")
                            .queryParam("affiliation", "owner,collaborator,organization_member")
                            .queryParam("sort", "updated")
                            .queryParam("per_page", PAGE_SIZE)
                            .queryParam("page", currentPage)
                            .build())
                    .retrieve()
                    .body(REPOSITORY_LIST);

            if (pageRepositories == null || pageRepositories.isEmpty()) {
                break;
            }

            allRepositories.addAll(pageRepositories);
            if (pageRepositories.size() < PAGE_SIZE) {
                break;
            }
        }

        return allRepositories;
    }

    public Map<String, Object> getRepoTree(
            String accessToken,
            String owner,
            String repo,
            String branch
    ) {
        return client(accessToken).get()
                .uri("/repos/{owner}/{repo}/git/trees/{branch}?recursive=1",
                        owner, repo, branch)
                .retrieve()
                .body(MAP);
    }

    public String getFileContent(
            String accessToken,
            String owner,
            String repo,
            String path
    ) {
        Map<String, Object> body = client(accessToken).get()
                .uri(uriBuilder -> uriBuilder
                        .path("/repos/{owner}/{repo}/contents/")
                        .path(path)
                        .build(owner, repo))
                .retrieve()
                .body(MAP);

        if (body == null) {
            return null;
        }

        Object encoding = body.get("encoding");
        Object content = body.get("content");
        if (content == null) {
            return null;
        }

        String fileContent = String.valueOf(content);
        if ("base64".equals(String.valueOf(encoding))) {
            String raw = fileContent.replaceAll("\\s", "");
            byte[] decoded = Base64.getDecoder().decode(raw);
            return new String(decoded, StandardCharsets.UTF_8);
        }

        return fileContent;
    }

    private RestClient client(String accessToken) {
        return restClientBuilder
                .baseUrl(API_BASE)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .defaultHeader(HttpHeaders.ACCEPT, "application/vnd.github+json")
                .defaultHeader("X-GitHub-Api-Version", "2022-11-28")
                .defaultHeader(HttpHeaders.USER_AGENT, "GitTalk")
                .build();
    }
}
