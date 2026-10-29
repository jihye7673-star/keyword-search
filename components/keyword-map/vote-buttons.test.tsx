import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { VoteButtons } from "@/components/keyword-map/vote-buttons";

beforeEach(() => window.localStorage.clear());
afterEach(() => window.localStorage.clear());

describe("좋아요와 싫어요", () => {
  it("하나만 선택되고 같은 것을 다시 누르면 해제되며, 선택하면 감사 문구가 보인다", () => {
    render(<VoteButtons voteKey="economy:코스피" />);
    const like = screen.getByRole("button", { name: "좋아요" });
    const dislike = screen.getByRole("button", { name: "싫어요" });
    expect(screen.queryByText(/고마워요/)).not.toBeInTheDocument();

    fireEvent.click(like);
    expect(like).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(/고마워요/)).toBeInTheDocument();

    fireEvent.click(dislike);
    expect(like).toHaveAttribute("aria-pressed", "false");
    expect(dislike).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(dislike);
    expect(dislike).toHaveAttribute("aria-pressed", "false");
    expect(screen.queryByText(/고마워요/)).not.toBeInTheDocument();
  });

  it("선택은 키워드마다 따로 이 브라우저에 남는다", () => {
    const first = render(<VoteButtons voteKey="economy:코스피" />);
    fireEvent.click(screen.getByRole("button", { name: "좋아요" }));
    first.unmount();

    const again = render(<VoteButtons voteKey="economy:코스피" />);
    expect(screen.getByRole("button", { name: "좋아요" })).toHaveAttribute("aria-pressed", "true");
    again.unmount();

    render(<VoteButtons voteKey="economy:환율" />);
    expect(screen.getByRole("button", { name: "좋아요" })).toHaveAttribute("aria-pressed", "false");
  });
});
