import React, { useEffect, useState } from "react";

import { Text, Title } from "../components/base";
import { Button, Modal, TextInput } from "../components/base";
import { DarkModeButton } from "../components/DarkModeButton";
import { TitledActionModal } from "../components/modals/TitledActionModal";
import { TitledModal } from "../components/modals/TitledModal";
import { Table } from "../components/table";
import { useModal } from "../hooks/useModal";
import { toast } from "../lib/toast";
import { CustomPage } from "../lib/types";

function ButtonsReference() {
  const variants = ["primary", "secondary", "outline"] as const;
  const propsets = [
    { title: "Normal", props: {} },
    {
      title: "Disabled",
      props: { disabled: true },
    },
    {
      title: "Floating",
      props: { floating: true },
    },
    {
      title: "Loading",
      props: { loading: true },
    },
  ];

  return (
    <>
      <div>
        <Button size="sm">Small button</Button>
        <Button size="sm" loading>
          Small button
        </Button>
        <Button size="xs">XS button</Button>
        <Button size="xs" loading>
          XS button
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-8">
        {variants.map((variant) => (
          <div key={variant} className="text-xl font-bold">
            <Text className="w-auto">{variant}</Text>
          </div>
        ))}
        {propsets.map(({ title, props }) => {
          return (
            <>
              {variants.map((variant) => (
                <div key={`${variant}-${title}`}>
                  <Text className="mb-1 text-grayLight-110">{title}</Text>
                  <Button variant={variant} {...props}>
                    Button
                  </Button>
                </div>
              ))}
            </>
          );
        })}
      </div>
    </>
  );
}

const DATA = [
  {
    type: "Deposit",
    currency: "BTC",
    amount: "$0.00",
  },
  {
    type: "Deposit",
    currency: "ETH",
    amount: "$0.00",
  },
  {
    type: "Withdraw",
    currency: "LTC",
    amount: "$0.00",
  },
];

function TableReference() {
  return (
    <Table
      columns={[
        {
          label: "Type",
          type: "string",
          align: "left",
          getCellValue: (tx) => tx.type,
        },
        {
          label: "Currency",
          type: "string",
          align: "right",
          getCellValue: (tx) => tx.currency,
        },
        {
          label: "Amount",
          type: "string",
          align: "right",
          getCellValue: (tx) => tx.amount,
        },
      ]}
      data={DATA}
      loading={false}
    />
  );
}

function InputReference() {
  const [value, setValue] = useState("");

  return (
    <div className="">
      <div className="h-4"></div>
      <TextInput
        label="Input with label"
        renderPrefix={() => {
          return (
            <div className="pointer-events-none">
              <Text>Prefix</Text>
            </div>
          );
        }}
        renderSuffix={() => {
          return (
            <div>
              <Text>Suffix</Text>
            </div>
          );
        }}
        placeholder="placeholder"
      />

      <TextInput label="Input with label" placeholder="placeholder"></TextInput>
    </div>
  );
}

function ModalReference() {
  const [isOpen, handlers] = useModal(false);
  const [isOpen2, handlers2] = useModal(false);
  const [isOpen3, handlers3] = useModal(false);
  return (
    <>
      <Modal isOpen={isOpen} onClose={handlers.close}>
        <div className="w-96 bg-white p-4">
          <Modal.Title>Title</Modal.Title>
          <Modal.Description>
            Barebones modal, nothing special here.
          </Modal.Description>
          <button>Lel</button>
        </div>
      </Modal>
      <TitledModal
        title="Titled Modal"
        isOpen={isOpen2}
        onGoBack={handlers2.close}
        onClose={handlers2.close}
      >
        <div className="border-4 border-grayLight-10">
          Modal content
          <Modal.Description>
            Description goes in this tag for accessibility
          </Modal.Description>
        </div>
      </TitledModal>
      <TitledActionModal
        title="Titled Action Modal"
        isOpen={isOpen3}
        onClose={handlers3.close}
        actionText="Primary action"
        onAction={async () => {
          toast.success("Primary action clicked");
          await new Promise((resolve) => setTimeout(resolve, 1000));
          toast.success("Modal closed");
          handlers3.close();
        }}
      >
        <div className="border-4 border-grayLight-10">
          Modal content
          <Modal.Description>
            Description goes in this tag for accessibility
          </Modal.Description>
        </div>
      </TitledActionModal>

      <Button onClick={handlers.open}>Modal</Button>

      <div className="h-4"></div>
      <Button onClick={handlers2.open}>TitledModal</Button>

      <div className="h-4"></div>
      <Button onClick={handlers3.open}>TitledActionModal</Button>
    </>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <Title
      order={2}
      className="section-title mb-12 w-full border-b pb-4 pt-16 text-3xl"
      id={title.replace(" ", "-")}
    >
      {title}
    </Title>
  );
}

const DesignPage: CustomPage = () => {
  const [headers, setHeaders] = useState<
    { title: string; link: string; element: any; show: boolean }[]
  >([]);

  useEffect(() => {
    setHeaders(
      Array.from(document.getElementsByTagName("h2")).map((el) => ({
        title: el.innerText,
        link: el.id,
        element: el,
        show: el.className.includes("section-title"),
      }))
    );
  }, []);

  return (
    <div className="flex h-screen w-full">
      <div className="h-full flex-none bg-grayLight-90 p-4 pr-8 text-white">
        <div className="flex items-center gap-4">
          <div className="text-xl font-bold">Components</div>
          <DarkModeButton />
        </div>
        <div className="h-8"></div>

        <div className="flex flex-col gap-1">
          {headers.map(({ title, link, element, show }, i) => {
            if (!show) return null;
            return (
              <div className="flex cursor-default gap-2" key={i}>
                →{" "}
                <div
                  className="cursor-pointer hover:underline"
                  onClick={() => {
                    element.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  {title}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="h-screen w-full overflow-y-auto bg-white px-8 py-4 dark:bg-black">
        <SectionTitle title="Toast" />
        <Button onClick={() => toast.success("Success toast")}>Success</Button>
        <div className="h-1"></div>
        <Button onClick={() => toast.error("Error toast")}>Error</Button>

        <SectionTitle title="Title" />
        <Title order={1}>Heading 1</Title>
        <Title order={2}>Heading 2</Title>
        <Title order={3}>Heading 3</Title>
        <Title order={4}>Heading 4</Title>
        <Title order={5}>Heading 5</Title>
        <Title order={6}>Heading 6</Title>

        <SectionTitle title="Buttons" />
        <ButtonsReference />

        <SectionTitle title="Input" />
        <InputReference />

        <SectionTitle title="Table" />
        <TableReference />

        <SectionTitle title="Modal" />
        <ModalReference />
      </div>
    </div>
  );
};

export default DesignPage;
