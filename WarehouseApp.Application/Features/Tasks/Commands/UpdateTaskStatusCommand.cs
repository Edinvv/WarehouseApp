using TaskStatus = WarehouseApp.Domain.Enums.TaskStatus;
using MediatR;
using Microsoft.EntityFrameworkCore;
using WarehouseApp.Application.Common.Interfaces;

namespace WarehouseApp.Application.Features.Tasks.Commands;

public enum UpdateStatusResult { Success, NotFound, Forbidden }

public record UpdateTaskStatusCommand(
    Guid TaskId,
    TaskStatus NewStatus,
    string CallerUserId,
    string CallerRole
) : IRequest<UpdateStatusResult>;

public class UpdateTaskStatusCommandHandler : IRequestHandler<UpdateTaskStatusCommand, UpdateStatusResult>
{
    private readonly IAppDbContext _context;
    public UpdateTaskStatusCommandHandler(IAppDbContext context) => _context = context;

    public async Task<UpdateStatusResult> Handle(UpdateTaskStatusCommand request, CancellationToken cancellationToken)
    {
        var task = await _context.WarehouseTasks.Include(t=>t.TaskAssignments)
            .FirstOrDefaultAsync(t => t.Id == request.TaskId, cancellationToken);

        if (task == null) return UpdateStatusResult.NotFound;

        if (request.CallerRole == "Worker" && !task.TaskAssignments.Any(a=>a.UserId == request.CallerUserId))
            return UpdateStatusResult.Forbidden;

        if (request.CallerRole == "Worker" && task.Status == TaskStatus.Done)
            return UpdateStatusResult.Forbidden;

        if (request.CallerRole == "Worker" && request.NewStatus == TaskStatus.Todo)
            return UpdateStatusResult.Forbidden;

        task.Status = request.NewStatus;

        if (request.NewStatus == TaskStatus.InProgress && task.StartedAt == null)
            task.StartedAt = DateTime.UtcNow;

        if (request.NewStatus == TaskStatus.Done)
            task.CompletedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);
        return UpdateStatusResult.Success;
    }
}