using MediatR;
using Microsoft.EntityFrameworkCore;
using WarehouseApp.Application.Common.Interfaces;
using WarehouseApp.Application.DTOs;

namespace WarehouseApp.Application.Features.OutboundOrders.Queries;

public record GetOutboundOrdersQuery : IRequest<List<OutboundOrderDto>>;

public class GetOutboundOrdersQueryHandler : IRequestHandler<GetOutboundOrdersQuery, List<OutboundOrderDto>>
{
    private readonly IAppDbContext _context;
    public GetOutboundOrdersQueryHandler(IAppDbContext context) => _context = context;

    public async Task<List<OutboundOrderDto>> Handle(GetOutboundOrdersQuery request, CancellationToken cancellationToken)
    {
        return await _context.OutboundOrders
            .Include(o => o.Items).ThenInclude(i => i.Sector)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new OutboundOrderDto(
                o.Id,
                o.RestaurantName,
                o.Status.ToString(),
                o.CreatedAt,
                o.Items.Select(i => new OutboundOrderItemDto(
                    i.Id, i.ProductName, i.Quantity, i.Barcode, i.SectorId, i.Sector.Name
                )).ToList()
            )).ToListAsync(cancellationToken);
    }
}