using MediatR;
using Microsoft.EntityFrameworkCore;
using WarehouseApp.Application.Common.Interfaces;

namespace WarehouseApp.Application.Features.Tasks.Queries;

public record GetTasksByOrderQuery(Guid OrderId) : IRequest<List<TaskSummaryDto>>;
public record TaskSummaryDto(Guid Id, string Title);

public class GetTasksByOrderQueryHandler : IRequestHandler<GetTasksByOrderQuery, List<TaskSummaryDto>>
{
    private readonly IAppDbContext _context;
    public GetTasksByOrderQueryHandler(IAppDbContext context) => _context = context;

    public async Task<List<TaskSummaryDto>> Handle(GetTasksByOrderQuery request, CancellationToken cancellationToken)
    {
        return await _context.WarehouseTasks
            .Where(t => t.InboundOrderId == request.OrderId)
            .Select(t => new TaskSummaryDto(t.Id, t.Title))
            .ToListAsync(cancellationToken);
    }
}