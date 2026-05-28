import {
    Stack,
    Card,
    TextArea,
    Box,
    Inline,
    Button,
    Label,
} from "@sanity/ui";
import { useCallback, useEffect, useRef, useState } from "react";
import { set, type ObjectInputProps, type ObjectSchemaType } from "sanity";

interface HtmlBlockValue {
    _type?: string;
    _key?: string;
    html?: string;
}

type Mode = "source" | "visual";

export function HtmlBlockInput(
    props: ObjectInputProps<HtmlBlockValue, ObjectSchemaType>,
) {
    const { value, onChange, schemaType } = props;
    const html = value?.html ?? "";
    const [mode, setMode] = useState<Mode>("source");
    const visualRef = useRef<HTMLDivElement | null>(null);

    const updateHtml = useCallback(
        (next: string) => {
            const patch = set(
                {
                    ...(value ?? {}),
                    _type: value?._type ?? schemaType.name,
                    html: next,
                },
                [],
            );
            onChange(patch);
        },
        [onChange, schemaType.name, value],
    );

    useEffect(() => {
        if (mode === "visual" && visualRef.current) {
            if (visualRef.current.innerHTML !== html) {
                visualRef.current.innerHTML = html;
            }
        }
    }, [mode, html]);

    const handleVisualBlur = () => {
        if (!visualRef.current) return;
        const next = visualRef.current.innerHTML;
        if (next !== html) {
            updateHtml(next);
        }
    };

    return (
        <Stack space={3}>
            <Inline space={2}>
                <Button
                    mode={mode === "source" ? "default" : "ghost"}
                    tone={mode === "source" ? "primary" : "default"}
                    text="HTML"
                    onClick={() => setMode("source")}
                    fontSize={1}
                    padding={2}
                />
                <Button
                    mode={mode === "visual" ? "default" : "ghost"}
                    tone={mode === "visual" ? "primary" : "default"}
                    text="Wizualnie"
                    onClick={() => setMode("visual")}
                    fontSize={1}
                    padding={2}
                />
            </Inline>

            {mode === "source" && (
                <TextArea
                    rows={12}
                    value={html}
                    onChange={(e) => updateHtml(e.currentTarget.value)}
                    placeholder='<table>
  <thead>
    <tr><th>Kolumna 1</th><th>Kolumna 2</th></tr>
  </thead>
  <tbody>
    <tr><td>Wartość 1</td><td>Wartość 2</td></tr>
  </tbody>
</table>'
                    style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
                />
            )}

            {mode === "visual" && (
                <Stack space={2}>
                    <Box>
                        <Label size={0} muted>
                            Kliknij w komórkę, aby edytować. Zmiany zapisują się
                            po wyjściu z pola.
                        </Label>
                    </Box>
                    <Card padding={3} border radius={2} tone="transparent">
                        <div
                            ref={visualRef}
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={handleVisualBlur}
                            style={{
                                minHeight: "120px",
                                outline: "none",
                                fontFamily: "inherit",
                            }}
                            className="html-block-preview"
                            dangerouslySetInnerHTML={{
                                __html:
                                    html ||
                                    "<p><em>Brak treści. Przełącz na zakładkę HTML, wklej tabelę lub kod, potem wróć tutaj.</em></p>",
                            }}
                        />
                    </Card>
                    <style>{`
                        .html-block-preview table {
                            width: 100%;
                            border-collapse: collapse;
                            font-size: 0.875rem;
                        }
                        .html-block-preview th,
                        .html-block-preview td {
                            padding: 8px 12px;
                            border-bottom: 1px solid #e7ecf7;
                            text-align: left;
                            vertical-align: top;
                        }
                        .html-block-preview thead th {
                            background: #0c111d;
                            color: #fff;
                            font-weight: 700;
                            text-transform: uppercase;
                            font-size: 0.8125rem;
                            letter-spacing: 0.02em;
                        }
                        .html-block-preview tbody tr:nth-child(even) td {
                            background: rgba(244, 246, 251, 0.4);
                        }
                        .html-block-preview a {
                            color: #007aff;
                        }
                    `}</style>
                </Stack>
            )}
        </Stack>
    );
}
