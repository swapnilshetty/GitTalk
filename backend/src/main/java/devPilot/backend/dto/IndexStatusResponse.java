package devPilot.backend.dto;

import java.util.UUID;
import java.time.Instant;

import devPilot.backend.entity.IndexStatus;

public record IndexStatusResponse (
    UUID repositoryId,
    IndexStatus indexStatus,
    int filesTotal,
    int filesProcessed,
    int chunkCount,
    Instant indexedAt,
    String errorMessage){

    }

