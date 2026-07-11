using MediatR;
using Microsoft.EntityFrameworkCore;
using WarehouseApp.Application.Common.Interfaces;
using WarehouseApp.Domain.Enums;
using TaskStatus = WarehouseApp.Domain.Enums.TaskStatus;

namespace WarehouseApp.Application.Features.InBoundOrders.Commands;

public enum CompleteOrderResult { Success, NotFound, TasksNotComplete }
public record CompleteInboundOrderCommand(Guid OrderId) : IRequest<CompleteOrderResult>;
public class CompleteInboundOrderCommandHandler : IRequestHandler<CompleteInboundOrderCommand, CompleteOrderResult>

{
    private readonly IAppDbContext _context;
    public CompleteInboundOrderCommandHandler(IAppDbContext context)
    {
        _context = context;
    }
    public async Task<CompleteOrderResult> Handle(CompleteInboundOrderCommand request, CancellationToken cancellationToken)
    {
        var result = await _context.InboundOrders.FirstOrDefaultAsync(o => o.Id == request.OrderId, cancellationToken);
        if (result is null)
        {
            return CompleteOrderResult.NotFound;
        }
        var allDone = await _context.WarehouseTasks
    .Where(t => t.InboundOrderId == request.OrderId)
    .AllAsync(t => t.Status == TaskStatus.Done, cancellationToken);
        if (!allDone)
        {
            return CompleteOrderResult.TasksNotComplete;
        }
        result.Status = InboundOrderStatus.Received;
        await _context.SaveChangesAsync(cancellationToken);
        return CompleteOrderResult.Success;
    }

}
