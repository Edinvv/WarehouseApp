using MediatR;
using Microsoft.EntityFrameworkCore;
using WarehouseApp.Application.Common.Interfaces;
using WarehouseApp.Application.DTOs;

namespace WarehouseApp.Application.Features.Products.Queries;

public record GetProductsBySectorIdQuery(Guid SectorId) : IRequest<List<ProductDto>>;
    public class GetProductsBySectorIdQueryHandler : IRequestHandler<GetProductsBySectorIdQuery, List<ProductDto>>
    {
        private readonly IAppDbContext _context;
        public GetProductsBySectorIdQueryHandler(IAppDbContext context)
        {
            _context = context;
        }
         public async Task<List<ProductDto>> Handle(GetProductsBySectorIdQuery request, CancellationToken cancellationToken)
        {
           var products = await _context.Products
                .Where(p=>p.SectorId == request.SectorId)
                .Select(p=> new ProductDto(
                    p.Id,
                    p.Name,
                    p.Quantity,
                    p.MinimumQuantity,
                    p.Barcode,
                    p.Quantity < p.MinimumQuantity
                ))
                .ToListAsync(cancellationToken);
            return products;
        }
    }
