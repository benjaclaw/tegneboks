import { Skia } from "@shopify/react-native-skia";

export interface Template {
  id: string;
  name: string;
  svgPath: string;
}

const templates: Template[] = [
  {
    id: "house",
    name: "Hus",
    svgPath:
      "M50 80 L50 45 L20 45 L50 20 L80 45 L50 45 M50 80 L20 80 L20 45 M50 80 L80 80 L80 45 M38 80 L38 62 L54 62 L54 80 M28 55 L28 65 L36 65 L36 55 Z",
  },
  {
    id: "flower",
    name: "Blomst",
    svgPath:
      "M50 95 L50 55 M50 42 A13 13 0 1 1 50.01 42 M37 38 A13 13 0 1 1 37.01 38 M63 38 A13 13 0 1 1 63.01 38 M35 52 A13 13 0 1 1 35.01 52 M65 52 A13 13 0 1 1 65.01 52 M40 75 Q45 65 50 70 Q55 65 60 75",
  },
  {
    id: "car",
    name: "Bil",
    svgPath:
      "M15 65 L15 50 L30 50 L38 35 L68 35 L78 50 L90 50 L90 65 L85 65 A8 8 0 1 1 69 65 L37 65 A8 8 0 1 1 21 65 Z M40 50 L40 38 L55 38 L55 50 M55 50 L55 38 L66 38 L74 50",
  },
  {
    id: "butterfly",
    name: "Sommerfugl",
    svgPath:
      "M50 25 L50 80 M50 40 Q20 15 15 40 Q10 60 50 55 M50 40 Q80 15 85 40 Q90 60 50 55 M50 55 Q25 50 20 70 Q18 85 50 75 M50 55 Q75 50 80 70 Q82 85 50 75 M45 22 Q40 12 35 15 M55 22 Q60 12 65 15",
  },
  {
    id: "star",
    name: "Stjerne",
    svgPath:
      "M50 10 L61 38 L92 38 L67 56 L77 85 L50 68 L23 85 L33 56 L8 38 L39 38 Z",
  },
];

export function getTemplates(): Template[] {
  return templates;
}

export function renderTemplateToBase64(
  template: Template,
  width: number,
  height: number,
): string {
  const surface = Skia.Surface.MakeOffscreen(width, height)!;
  const canvas = surface.getCanvas();

  // Hvit bakgrunn
  const bgPaint = Skia.Paint();
  bgPaint.setColor(Skia.Color("#FFFFFF"));
  canvas.drawRect(Skia.XYWHRect(0, 0, width, height), bgPaint);

  // Tegn SVG-mal skalert til canvas
  const path = Skia.Path.MakeFromSVGString(template.svgPath);
  if (path) {
    const bounds = path.getBounds();
    const svgW = bounds.width || 100;
    const svgH = bounds.height || 100;

    const padding = 40;
    const availW = width - padding * 2;
    const availH = height - padding * 2;
    const scale = Math.min(availW / svgW, availH / svgH);

    const offsetX = (width - svgW * scale) / 2 - bounds.x * scale;
    const offsetY = (height - svgH * scale) / 2 - bounds.y * scale;

    canvas.save();
    canvas.translate(offsetX, offsetY);
    canvas.scale(scale, scale);

    const paint = Skia.Paint();
    paint.setColor(Skia.Color("#CCCCCC"));
    paint.setStyle(1); // Stroke
    paint.setStrokeWidth(2);
    paint.setAntiAlias(true);
    canvas.drawPath(path, paint);

    canvas.restore();
    path.reset();
  }

  surface.flush();
  const image = surface.makeImageSnapshot();
  const encoded = image.encodeToBase64();
  return encoded;
}
