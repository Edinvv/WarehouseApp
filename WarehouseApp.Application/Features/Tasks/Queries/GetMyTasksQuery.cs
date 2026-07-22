using MediatR;
using Microsoft.EntityFrameworkCore;
using WarehouseApp.Application.Common.Interfaces;
using WarehouseApp.Application.DTOs;
using TaskStatus = WarehouseApp.Domain.Enums.TaskStatus;

namespace WarehouseApp.Application.Features.Tasks.Queries;

public record GetMyTasksQuery(string UserId) : IRequest<List<TaskDto>>;

public class GetMyTasksQueryHandler : IRequestHandler<GetMyTasksQuery, List<TaskDto>>
{
    private readonly IAppDbContext _context;
    public GetMyTasksQueryHandler(IAppDbContext context) => _context = context;

    public async Task<List<TaskDto>> Handle(GetMyTasksQuery request, CancellationToken cancellationToken)
    {
        return await _context.WarehouseTasks
            .Where(t => t.TaskAssignments.Any(a => a.UserId == request.UserId))
            .Include(t => t.TaskAssignments).ThenInclude(a => a.User)
            .Include(t => t.Items)
            .Include(t => t.Sector)
            .Select(t => new TaskDto(
                t.Id,
                t.Title,
                t.Description,
                t.Status.ToString(),
                t.Priority.ToString(),
                t.DueDate,
                t.CreatedAt,
                t.StartedAt,
                t.CompletedAt,
                t.SectorId,
                t.Sector.Name,
                t.TaskAssignments.Select(a => new TaskAssignmentDto(
                    a.UserId,
                    a.User.FirstName + " " + a.User.LastName
                )).ToList(),
                t.Items.Select(i => new TaskItemDto(
                    i.Id,
                    i.ProductName,
                    i.Quantity,
                    i.IsCompleted,
                    i.Barcode
                )).ToList()
            )).ToListAsync(cancellationToken);
    }
}