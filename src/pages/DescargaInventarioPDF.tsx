import { useLazyQuery } from "@apollo/client";
import { Button } from "@mui/material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { REPORTE_INVENTARIO } from "../graphql/queries/inventario";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

interface Props {
    filtros: {
        familiaId: string;
        proveedorId: string;
        stockMenorQue: string;
        stockMayorQue: string;
    };
}

export default function DescargaInventarioPDF({ filtros }: Props) {
    const [fetchPDFData, { loading }] = useLazyQuery(REPORTE_INVENTARIO, {
        fetchPolicy: "network-only",
        onCompleted: (data) => {
            if (!data?.reporteInventario) return;

            const doc = new jsPDF();

            doc.setFontSize(14);
            doc.text("Reporte de Inventario", 14, 20);

            const rows = data.reporteInventario.map((item: any) => [
                item.codigoBarras,
                item.nombre,
                item.familia,
                item.proveedor,
                item.existencias,
                item.costoUnitario,
                item.precioVenta,
                item.margenUnitario,
                item.costoTotal,
            ]);

            autoTable(doc, {
                startY: 30,
                head: [
                    [
                        "Código",
                        "Producto",
                        "Familia",
                        "Proveedor",
                        "Stock",
                        "Costo ₡",
                        "Venta ₡",
                        "Margen ₡",
                        "Costo total",
                    ],
                ],
                body: rows,
                styles: {
                    fontSize: 8,
                },
                headStyles: {
                    fillColor: [22, 160, 133],
                },
            });

            doc.save("reporte-inventario.pdf");
        },
    });

    const handleDownload = () => {
        fetchPDFData({
            variables: {
                familiaId: filtros.familiaId ? Number(filtros.familiaId) : undefined,
                proveedorId: filtros.proveedorId ? Number(filtros.proveedorId) : undefined,
                stockMenorQue: filtros.stockMenorQue ? Number(filtros.stockMenorQue) : undefined,
                stockMayorQue: filtros.stockMayorQue ? Number(filtros.stockMayorQue) : undefined,
            },
        });
    };


    return (
        <Button
            variant="contained"
            startIcon={<PictureAsPdfIcon />}
            onClick={handleDownload}
            disabled={loading}
            color="secondary"
        >
            Exportar PDF
        </Button>
    );
}