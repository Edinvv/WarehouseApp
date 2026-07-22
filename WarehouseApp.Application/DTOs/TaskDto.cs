

namespace WarehouseApp.Application.DTOs;

   
public record TaskDto(
    Guid Id,
    string Title,
    string? Description,
    string Status,
    string Priority,
    DateTime? DueDate,
    DateTime CreatedAt,
    DateTime? StartedAt,
    DateTime? CompletedAt,
    Guid SectorId,
    string? SectorName,
    List<TaskAssignmentDto> Assignments,
    List<TaskItemDto> Items
);
    
