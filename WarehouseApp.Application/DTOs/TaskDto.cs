

namespace WarehouseApp.Application.DTOs;

   
public record TaskDto(
    Guid Id,
    string Title,
    string? Description,
    string Status,
    string Priority,
    DateTime? DueDate,
    DateTime CreatedAt,
    Guid SectorId,
    List<TaskAssignmentDto> Assignments
);
    
