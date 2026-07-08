using System.Text.Json;
using MediatR;
using Microsoft.EntityFrameworkCore;
using WarehouseApp.Application.Common.Interfaces;
using WarehouseApp.Domain.Entities;
using WarehouseApp.Domain.Enums;
using TaskStatus = WarehouseApp.Domain.Enums.TaskStatus;

namespace WarehouseApp.Application.Features.Tasks.Commands;

public record CreateTaskCommand(
    string Title,
    string? Description,
    TaskPriority Priority,
    DateTime? DueDate,
    Guid SectorId,
    string? AssignedToId,
    string CreatedById
) : IRequest<Guid>;

public class CreateTaskCommandHandler : IRequestHandler<CreateTaskCommand, Guid>
{
    private readonly IAppDbContext _context;
    private readonly INotificationService _notificationService;

    public CreateTaskCommandHandler(IAppDbContext context, INotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }

    public async Task<Guid> Handle(CreateTaskCommand request, CancellationToken cancellationToken)
    {
        var task = new WarehouseTask
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Description = request.Description,
            Priority = request.Priority,
            DueDate = request.DueDate,
            SectorId = request.SectorId,
            AssignedToId = request.AssignedToId,
            CreatedById = request.CreatedById,
            Status = TaskStatus.Todo,
            CreatedAt = DateTime.UtcNow
        };

        await _context.WarehouseTasks.AddAsync(task, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        if (request.AssignedToId is not null)
        {
            var sector = await _context.Sectors
                .FirstOrDefaultAsync(s => s.Id == request.SectorId, cancellationToken);
            var sectorName = sector?.Name ?? "Unknown";

            var metadata = JsonSerializer.Serialize(new
            {
                sectorId = task.SectorId,
                taskId = task.Id
            });

            await _notificationService.SendToUserAsync(
                request.AssignedToId,
                $"You have been assigned a new task: {request.Title} — Sector: {sectorName}",
                "TaskAssigned",
                metadata
            );
        }

        return task.Id;
    }
}