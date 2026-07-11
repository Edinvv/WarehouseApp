using MediatR;
using Microsoft.EntityFrameworkCore;
using WarehouseApp.Application.Common.Interfaces;
using WarehouseApp.Application.DTOs;

namespace WarehouseApp.Application.Features.InBoundOrders.Queries;

public record GetInboundOrdersQuery(): IRequest<List<InboundOrderDto>>;
    public class GetInboundOrdersQueryHandler : IRequestHandler<GetInboundOrdersQuery, List<InboundOrderDto>>
    {
        private readonly IAppDbContext _context;
        public GetInboundOrdersQueryHandler(IAppDbContext context)
    {
        _context=context;
    }
    public async Task<List<InboundOrderDto>> Handle(GetInboundOrdersQuery request, CancellationToken cancellationToken)
    {
        return await _context.InboundOrders.Include(o=>o.Items).Select(o=>new InboundOrderDto(
            o.Id,
            o.SupplierName,
            o.Status.ToString(),
            o.CreatedById,
            o.ReviewedById,
            o.CreatedAt,
            o.Items.Select(i=>new InboundOrderItemDto(
                i.Id,
                i.ProductName,
                i.Barcode,
                i.Quantity,
                i.MinimumQuantity,
                i.SectorId
            )).ToList()
        )).ToListAsync(cancellationToken);
    }
    }
