using MediatR;
using Microsoft.EntityFrameworkCore;
using WarehouseApp.Application.Common.Interfaces;
using WarehouseApp.Application.DTOs;

namespace WarehouseApp.Application.Features.Tasks.Queries;

    public record GetTaskBySectorQuery(Guid SectorId) : IRequest<List<TaskDto>>;
    public class GetTaskBySectorQueryHandler : IRequestHandler<GetTaskBySectorQuery, List<TaskDto>>
    {
        private readonly IAppDbContext _context;
        public GetTaskBySectorQueryHandler(IAppDbContext context)
        {
            _context = context;
        }
        public async Task<List<TaskDto>> Handle(GetTaskBySectorQuery request, CancellationToken cancellationToken)
        {
            var tasks = await _context.WarehouseTasks
            .Where(t => t.SectorId == request.SectorId)
            .Include(t => t.AssignedTo)
            .Select(t => new TaskDto(
                t.Id,
                t.Title,
                t.Description,
                t.Status.ToString(),
                t.Priority.ToString(),
                t.DueDate,
                t.CreatedAt,
                t.SectorId,
                t.AssignedToId,
                t.AssignedTo != null ? $"{t.AssignedTo.FirstName} {t.AssignedTo.LastName}" : null
            )).ToListAsync(cancellationToken);
            return tasks;
        }
    }
