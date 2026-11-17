package devPilot.backend.services.ai;

import java.util.List;

import org.springframework.ai.document.Document;
import org.springframework.stereotype.Component;

import tools.jackson.core.JacksonException;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.json.JsonMapper;

import devPilot.backend.dto.CitationDto;
import lombok.RequiredArgsConstructor;

/**
 * Converts vector-store documents to API citations and persisted JSON.
 */
@Component
@RequiredArgsConstructor
public class CitationMapper {

    private final JsonMapper jsonMapper;

    public CitationDto fromDocument(Document document) {
        var metadata = document.getMetadata();
        return new CitationDto(
                stringVal(metadata.get("filePath")),
                intVal(metadata.get("startLine")),
                intVal(metadata.get("endLine")),
                stringVal(metadata.get("language")));
    }

    public String toJson(List<CitationDto> citations) {
        try {
            return jsonMapper.writeValueAsString(citations);
        } catch (JacksonException e) {
            return "[]";
        }
    }

    public List<CitationDto> fromJson(String json) {
        try {
            return jsonMapper.readValue(json, new TypeReference<>() {});
        } catch (JacksonException e) {
            return List.of();
        }
    }

    private static String stringVal(Object value) {
        return value == null ? null : value.toString();
    }

    private static Integer intVal(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number number) {
            return number.intValue();
        }
        return Integer.valueOf(value.toString());
    }
}
