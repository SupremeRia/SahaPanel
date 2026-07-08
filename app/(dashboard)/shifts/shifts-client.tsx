"use client";

import { ImagePlus, Images } from "lucide-react";
import { ActionForm, DeleteButton, SubmitButton } from "@/components/action-form";
import { Dialog } from "@/components/modal";
import { ImageLightbox } from "@/components/lightbox";
import {
  EmptyState,
  Field,
  Panel,
  SectionTitle,
  buttonClass,
  inputClass,
  secondaryButtonClass
} from "@/components/ui";
import { createShiftBoard, deleteShiftBoard } from "@/app/actions";
import type { ShiftBoard } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const fileInputClass =
  "focus-ring w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink transition file:mr-3 file:rounded file:border-0 file:bg-surface-2 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-ink hover:file:bg-surface";

export function ShiftsClient({ boards, isManager }: { boards: ShiftBoard[]; isManager: boolean }) {
  return (
    <Panel className="flex flex-col gap-4">
      <SectionTitle
        title="Haftalık Vardiya Planı"
        description="Excel'den oluşturduğunuz haftalık planı görsel olarak paylaşın; küçük resme tıklayınca büyür."
        action={
          isManager ? (
            <Dialog
              title="Vardiya görseli ekle"
              description="Haftalık plan görselini yükleyin (JPG, PNG veya WebP)."
              trigger={(open) => (
                <button type="button" onClick={open} className={buttonClass}>
                  <ImagePlus className="h-4 w-4" aria-hidden />
                  Görsel ekle
                </button>
              )}
            >
              {(close) => (
                <ActionForm action={createShiftBoard} onSuccess={close} className="grid gap-4">
                  <Field label="Başlık" hint="Örn. 12-18 Mayıs Haftası">
                    <input name="title" className={inputClass} placeholder="İsteğe bağlı" />
                  </Field>
                  <Field label="Hafta başlangıcı" hint="İsteğe bağlı">
                    <input name="week_start" type="date" className={inputClass} />
                  </Field>
                  <Field label="Görsel">
                    <input name="image" type="file" accept="image/*" required className={fileInputClass} />
                  </Field>
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={close} className={secondaryButtonClass}>
                      Vazgeç
                    </button>
                    <SubmitButton icon={ImagePlus}>Yükle</SubmitButton>
                  </div>
                </ActionForm>
              )}
            </Dialog>
          ) : undefined
        }
      />

      {boards.length === 0 ? (
        <EmptyState
          icon={Images}
          title="Henüz plan görseli yok"
          description="Haftalık vardiya planını görsel olarak yükleyerek ekiple paylaşın."
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {boards.map((board) => (
            <div key={board.id} className="flex flex-col gap-2">
              <ImageLightbox
                src={board.image_url}
                alt={board.title ?? "Vardiya planı"}
                title={board.title ?? "Vardiya planı"}
                thumbClassName="aspect-[4/3] w-full"
              />
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{board.title ?? "Vardiya planı"}</p>
                  {board.week_start ? (
                    <p className="text-xs text-muted-2">{formatDate(board.week_start)}</p>
                  ) : null}
                </div>
                {isManager ? (
                  <DeleteButton
                    action={deleteShiftBoard}
                    fields={{ id: board.id, image_url: board.image_url }}
                    title="Görseli sil"
                  />
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
