"use client";

import { ModalContainer, ModalStatus } from "@/components/modal/components";
import { Heading3 } from "@breadcoop/ui";
import { ModalClose } from "../shared";

export const LoadingState = ({ onClose }: { onClose: () => void }) => (
  <ModalContainer status="loading" className="max-w-142!">
    <ModalClose onClick={onClose} />
    <ModalStatus status="loading" />
    <Heading3 className="text-2xl text-center">Automatic Deposits</Heading3>
  </ModalContainer>
);
